/**
 * Fetches linked people from a Wikipedia page
 * @param {string} title - Wikipedia article title
 * @returns {Promise<string[]>} Array of linked people
 */
export const fetchLinkedPeople = async (title) => {
    try {
        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=links&format=json&origin=*`
        );
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.parse?.links) return [];
        
        return data.parse.links
            .filter(link => link.ns === 0)
            .map(link => link['*'])
            .filter(link => (
                !link.includes("(disambiguation)") &&
                !link.includes("List of") &&
                !link.startsWith("Timeline") &&
                !link.includes("Index of") &&
                !link.includes("Category:") &&
                link !== title
            ));
    } catch (error) {
        console.error("Error fetching links:", error);
        return [];
    }
};

/**
 * Fetches person details and image from Wikipedia
 * @param {string} title - Wikipedia article title
 * @returns {Promise<{description: string, imageUrl: string|null}>}
 */
export const fetchPersonDetailsWithImage = async (title) => {
    try {
        const [extractRes, imageRes] = await Promise.all([
            fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(title)}&format=json&origin=*`),
            fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=400&format=json&origin=*`)
        ]);
        
        if (!extractRes.ok || !imageRes.ok) {
            throw new Error(`API error: ${extractRes.status || imageRes.status}`);
        }
        
        const extractData = await extractRes.json();
        const imageData = await imageRes.json();
        
        const pages = extractData.query.pages;
        const pageId = Object.keys(pages)[0];
        const extract = pages[pageId].extract || "";
        
        const description = extract.split('.')[0] + (extract.includes('.') ? '.' : '');
        
        let imageUrl = null;
        if (imageData.query?.pages?.[pageId]?.thumbnail?.source) {
            imageUrl = imageData.query.pages[pageId].thumbnail.source;
        }
        
        return { description, imageUrl };
    } catch (error) {
        console.error(`Error fetching details for ${title}:`, error);
        return { description: "Notable figure", imageUrl: null };
    }
};

/**
 * Fetches a random pair of people from Wikipedia
 * @returns {Promise<{start: Object, target: Object}>}
 */
export const fetchRandomPeoplePair = async () => {
    const popularPeopleCategories = [
        "Academy_Award_winners", "American_film_actors", "American_politicians",
        "Heads_of_state", "Nobel_Prize_winners", "Olympic_gold_medalists",
        "World_leaders", "Time_Person_of_the_Year", "Forbes_list_of_billionaires",
        "Popular_musicians", "Hollywood_Walk_of_Fame"
    ];
    
    try {
        const randomCategory = popularPeopleCategories[Math.floor(Math.random() * popularPeopleCategories.length)];
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${randomCategory}&cmlimit=50&format=json&origin=*`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data?.query?.categorymembers?.length) {
            const peoplePages = data.query.categorymembers.filter(page => 
                !page.title.includes("Category:") && 
                !page.title.includes("List of") &&
                !page.title.startsWith("Timeline") &&
                !page.title.includes("Index of")
            );
            
            if (peoplePages.length < 2) {
                throw new Error("Not enough people found");
            }
            
            const shuffled = [...peoplePages].sort(() => 0.5 - Math.random());
            const person1 = shuffled[0];
            
            const person1Links = await fetchLinkedPeople(person1.title);
            
            const secondDegreeLinks = new Set();
            const sampleSize = Math.min(5, person1Links.length);
            const sampleLinks = person1Links.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
            
            for (const link of sampleLinks) {
                try {
                    const secondLinks = await fetchLinkedPeople(link);
                    secondLinks.forEach(link => secondDegreeLinks.add(link));
                } catch (error) {
                    console.error(`Error with second-degree links:`, error);
                }
            }
            
            const availablePeople = shuffled.filter(person => 
                person.title !== person1.title && 
                !person1Links.includes(person.title) &&
                !secondDegreeLinks.has(person.title)
            );
            
            if (availablePeople.length === 0) {
                return fetchRandomPeoplePair();
            }
            
            const person2 = availablePeople[0];
            
            if (person1.title.toLowerCase() === person2.title.toLowerCase()) {
                return fetchRandomPeoplePair();
            }
            
            const [person1Details, person2Details] = await Promise.all([
                fetchPersonDetailsWithImage(person1.title),
                fetchPersonDetailsWithImage(person2.title)
            ]);
            
            return {
                start: { 
                    title: person1.title, 
                    description: person1Details.description || "No description available",
                    imageUrl: person1Details.imageUrl
                },
                target: { 
                    title: person2.title, 
                    description: person2Details.description || "No description available",
                    imageUrl: person2Details.imageUrl
                }
            };
        }
        
        throw new Error("Failed to fetch from categories");
    } catch (error) {
        console.error("Error fetching people:", error);
        
        try {
            const featuredResponse = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=10&format=json&origin=*`
            );
            
            if (!featuredResponse.ok) {
                throw new Error(`API error: ${featuredResponse.status}`);
            }
            
            const featuredData = await featuredResponse.json();
            
            if (featuredData?.query?.random?.length >= 2) {
                const randomPages = featuredData.query.random;
                
                // Make sure the pages are different
                if (randomPages[0].title.toLowerCase() === randomPages[1].title.toLowerCase()) {
                    randomPages[1] = randomPages[2] || { title: "Biology" };
                }
                
                const [person1Details, person2Details] = await Promise.all([
                    fetchPersonDetailsWithImage(randomPages[0].title),
                    fetchPersonDetailsWithImage(randomPages[1].title)
                ]);
                
                return {
                    start: { 
                        title: randomPages[0].title, 
                        description: person1Details.description || "Wikipedia article",
                        imageUrl: person1Details.imageUrl
                    },
                    target: { 
                        title: randomPages[1].title, 
                        description: person2Details.description || "Wikipedia article",
                        imageUrl: person2Details.imageUrl
                    }
                };
            }
            
            throw new Error("No random articles available");
        } catch (secondError) {
            console.error("All fetching methods failed:", secondError);
            
            // Fallback to fixed pair
            return {
                start: { 
                    title: "Physics", 
                    description: "Branch of science",
                    imageUrl: null
                },
                target: { 
                    title: "Biology", 
                    description: "Study of life",
                    imageUrl: null
                }
            };
        }
    }
};

/**
 * Validates if a Wikipedia title exists
 * @param {string} title - Wikipedia article title to validate
 * @returns {Promise<boolean>} Whether the title exists
 */
export const validateWikipediaTitle = async (title) => {
    try {
        if (!title.trim()) return false;
        
        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&format=json&origin=*`
        );
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        return !pageId.startsWith('-');
    } catch (error) {
        console.error("Error validating Wikipedia title:", error);
        return false;
    }
}; 