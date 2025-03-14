import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './WikiConnect.css';

const WikiConnect = () => {
    const [startPerson, setStartPerson] = useState(null);
    const [targetPerson, setTargetPerson] = useState(null);
    const [currentPerson, setCurrentPerson] = useState(null);
    const [personChain, setPersonChain] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gameActive, setGameActive] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [seconds, setSeconds] = useState(0);
    const [showRules, setShowRules] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [linkedPeople, setLinkedPeople] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [peopleCache, setPeopleCache] = useState({});
    const [showCustomSetup, setShowCustomSetup] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customTarget, setCustomTarget] = useState('');
    const [customError, setCustomError] = useState('');
    const [customLoading, setCustomLoading] = useState(false);
    
    const timerRef = useRef(null);
    const inputRef = useRef(null);
    
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };
    
    const searchPeople = useMemo(() => 
        debounce((searchTerm) => {
            if (!searchTerm || searchTerm.length < 2 || !linkedPeople?.length) {
        setSuggestions([]);
                return;
            }
            
            const normalizedTerm = searchTerm.toLowerCase().trim();
            const filtered = linkedPeople.filter(person => {
                if (!person) return false;
                const personName = person.toLowerCase();
                
                if (personName.includes(normalizedTerm)) return true;
                
                const searchWords = normalizedTerm.split(/\s+/).filter(word => word.length > 0);
                if (searchWords.length > 1) {
                    return searchWords.every(word => personName.includes(word));
                }
                
                return false;
            });
            
            const sortedResults = filtered
                .sort((a, b) => {
                    const aLower = a.toLowerCase();
                    const bLower = b.toLowerCase();
                    
                    if (aLower === normalizedTerm) return -1;
                    if (bLower === normalizedTerm) return 1;
                    if (aLower.startsWith(normalizedTerm)) return -1;
                    if (bLower.startsWith(normalizedTerm)) return 1;
                    return aLower.indexOf(normalizedTerm) - bLower.indexOf(normalizedTerm);
                })
                .slice(0, 5);
                
            setSuggestions(sortedResults);
        }, 150), 
        [linkedPeople]
    );
    
    const fetchLinkedPeople = async (title) => {
        try {
            const response = await fetch(
                `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=links&format=json&origin=*`
            );
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
    
    const fetchPersonDetailsWithImage = async (title) => {
        try {
            const [extractRes, imageRes] = await Promise.all([
                fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(title)}&format=json&origin=*`),
                fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=400&format=json&origin=*`)
            ]);
            
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
    
    const fetchPersonDetailsWithCache = async (title) => {
        if (peopleCache[title]) return peopleCache[title];
        
        const details = await fetchPersonDetailsWithImage(title);
        setPeopleCache(prev => ({ ...prev, [title]: details }));
        return details;
    };
    
    const fetchLinkedPeopleWithCache = async (title) => {
        const cacheKey = `links_${title}`;
        if (peopleCache[cacheKey]) return peopleCache[cacheKey];
        
        const links = await fetchLinkedPeople(title);
        setPeopleCache(prev => ({ ...prev, [cacheKey]: links }));
        return links;
    };
    
    const handleInputChange = (e) => {
        setUserInput(e.target.value);
        setSelectedIndex(-1);
        searchPeople(e.target.value);
    };
    
    const handleSubmitPerson = useCallback(async () => {
        if (!userInput) return;
        
        try {
            setErrorMessage('');
            const normalizedInput = userInput.trim();
            
            if (normalizedInput.toLowerCase() === targetPerson.title.toLowerCase()) {
                handleSuccess(targetPerson);
                return;
            }
            
            const directMatch = linkedPeople.find(
                person => person.toLowerCase() === normalizedInput.toLowerCase()
            );
            
            if (directMatch) {
                const [details, links] = await Promise.all([
                    fetchPersonDetailsWithCache(directMatch),
                    fetchLinkedPeopleWithCache(directMatch)
                ]);
                
                const nextPerson = {
                    title: directMatch,
                    description: details.description,
                    imageUrl: details.imageUrl
                };
                
                setPersonChain(prev => [...prev, nextPerson]);
                setCurrentPerson(nextPerson);
                setLinkedPeople(links);
                setUserInput('');
                setSuggestions([]);
                
                if (nextPerson.title.toLowerCase() === targetPerson.title.toLowerCase()) {
                    handleSuccess(nextPerson);
                }
                
                if (inputRef.current) inputRef.current.focus();
            } else {
                const matches = linkedPeople.filter(person => 
                    person.toLowerCase().includes(normalizedInput.toLowerCase()) ||
                    normalizedInput.toLowerCase().includes(person.toLowerCase())
                );
                
                if (matches.length > 0) {
                    setErrorMessage(`Did you mean: ${matches.slice(0, 3).join(', ')}...?`);
                } else {
                    try {
                        const redirectResponse = await fetch(
                            `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(normalizedInput)}&redirects=1&format=json&origin=*`
                        );
                        const redirectData = await redirectResponse.json();
                        
                        if (redirectData.query?.redirects) {
                            const redirectTitle = redirectData.query.redirects[0].to;
                            const redirectMatch = linkedPeople.find(
                                person => person.toLowerCase() === redirectTitle.toLowerCase()
                            );
                            
                            if (redirectMatch) {
                                const details = await fetchPersonDetailsWithCache(redirectMatch);
                                const nextPerson = {
                                    title: redirectMatch,
                                    description: details.description,
                                    imageUrl: details.imageUrl
                                };
                                
                                setPersonChain([...personChain, nextPerson]);
                                setCurrentPerson(nextPerson);
                                
                                const links = await fetchLinkedPeopleWithCache(nextPerson.title);
                                setLinkedPeople(links);
                                
                                if (nextPerson.title.toLowerCase() === targetPerson.title.toLowerCase()) {
                                    handleSuccess(nextPerson);
                                }
                                
                                setUserInput('');
                                setSuggestions([]);
                                
                                if (inputRef.current) inputRef.current.focus();
                                return;
                            }
                        }
                    } catch (error) {
                        console.error("Error checking redirects:", error);
                    }
                    
                    setErrorMessage(`${normalizedInput} is not mentioned on ${currentPerson.title}'s Wikipedia page.`);
                }
            }
        } catch (error) {
            console.error("Error submitting person:", error);
            setErrorMessage("Error processing your input. Please try again.");
        }
    }, [userInput, linkedPeople, targetPerson, personChain, currentPerson]);
    
    const fetchRandomPeoplePair = async () => {
        const popularPeopleCategories = [
            "Academy_Award_winners", "American_film_actors", "American_politicians",
            "Heads_of_state", "Nobel_Prize_winners", "Olympic_gold_medalists",
            "World_leaders", "Time_Person_of_the_Year", "Forbes_list_of_billionaires",
            "Popular_musicians", "Hollywood_Walk_of_Fame"
        ];
        
        try {
            const randomCategory = popularPeopleCategories[Math.floor(Math.random() * popularPeopleCategories.length)];
            const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${randomCategory}&cmlimit=50&format=json&origin=*`);
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
            
            const remainingCategories = popularPeopleCategories.filter(
                cat => !cat.includes(error.category)
            );
            
            if (remainingCategories.length > 0) {
                console.log("Trying with a different category...");
                return fetchRandomPeoplePair();
            }
            
            try {
                const featuredResponse = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=10&format=json&origin=*`
                );
                const featuredData = await featuredResponse.json();
                
                if (featuredData?.query?.random?.length >= 2) {
                    const randomPages = featuredData.query.random;
                    
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
                
                const date = new Date();
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
    
    const startGame = async () => {
        setLoading(true);
        setGameActive(true);
        setGameComplete(false);
        setUserInput('');
        setSuggestions([]);
        setErrorMessage('');
        setSeconds(0);
        setPersonChain([]);
        
        try {
            const peoplePair = await fetchRandomPeoplePair();
            
            setStartPerson(peoplePair.start);
            setTargetPerson(peoplePair.target);
            setCurrentPerson(peoplePair.start);
            setPersonChain([peoplePair.start]);
            
            const links = await fetchLinkedPeople(peoplePair.start.title);
            setLinkedPeople(links);
            
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
            
            if (inputRef.current) inputRef.current.focus();
        } catch (error) {
            console.error("Error starting game:", error);
            setErrorMessage("Failed to start game. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelectSuggestion(suggestions[selectedIndex]);
                } else {
            handleSubmitPerson();
                }
                break;
            case 'Escape':
                setSuggestions([]);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };
    
    const handleSelectSuggestion = (suggestion) => {
        setUserInput(suggestion);
        setSuggestions([]);
        if (inputRef.current) inputRef.current.focus();
    };
    
    const handleSuccess = (person) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameComplete(true);
    };
    
    const goBack = () => {
        if (personChain.length <= 1 || loading) return;
        
        const newChain = personChain.slice(0, -1);
        const newCurrentPerson = newChain[newChain.length - 1];
        
        setPersonChain(newChain);
        setCurrentPerson(newCurrentPerson);
        setUserInput('');
        setSuggestions([]);
        setErrorMessage('');
        
        fetchLinkedPeople(newCurrentPerson.title)
            .then(links => setLinkedPeople(links));
    };
    
    const shareScore = () => {
        const text = `I connected ${personChain[0].title} to ${personChain[personChain.length-1].title} in ${personChain.length-1} steps and ${formatTime(seconds)}! #WikiConnect`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My WikiConnect Score',
                text: text
            });
        } else {
            navigator.clipboard.writeText(text)
                .then(() => alert('Score copied to clipboard!'))
                .catch(() => alert('Could not copy score. ' + text));
        }
    };
    
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmitPerson();
    };
    
    useEffect(() => {
        startGame();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);
    
    const getWikipediaUrl = (title) => {
        return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    };
    
    const validateWikipediaTitle = async (title) => {
        try {
            if (!title.trim()) return false;
            
            const response = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&format=json&origin=*`
            );
            const data = await response.json();
            
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            return !pageId.startsWith('-');
        } catch (error) {
            console.error("Error validating Wikipedia title:", error);
            return false;
        }
    };
    
    const startCustomGame = async () => {
        setCustomError('');
        setCustomLoading(true);
        
        try {
            const [startValid, targetValid] = await Promise.all([
                customStart ? validateWikipediaTitle(customStart) : true,
                customTarget ? validateWikipediaTitle(customTarget) : true,
            ]);
            
            if (customStart && !startValid) {
                setCustomError("Start person not found on Wikipedia. Please check the spelling.");
                setCustomLoading(false);
                return;
            }
            
            if (customTarget && !targetValid) {
                setCustomError("Target person not found on Wikipedia. Please check the spelling.");
                setCustomLoading(false);
                return;
            }
            
            setShowCustomSetup(false);
            setCustomLoading(false);
            if (!customStart && !customTarget) {
                startGame();
                return;
            }
            
            setLoading(true);
            setGameActive(true);
            setGameComplete(false);
            setUserInput('');
            setSuggestions([]);
            setErrorMessage('');
            setSeconds(0);
            setPersonChain([]);
            
            try {
                let startPerson, targetPerson;
                
                if (customStart) {
                    const startDetails = await fetchPersonDetailsWithImage(customStart);
                    startPerson = {
                        title: customStart,
                        description: startDetails.description || "No description available",
                        imageUrl: startDetails.imageUrl
                    };
                }
                
                if (customTarget) {
                    const targetDetails = await fetchPersonDetailsWithImage(customTarget);
                    targetPerson = {
                        title: customTarget,
                        description: targetDetails.description || "No description available",
                        imageUrl: targetDetails.imageUrl
                    };
                }
                
                if (customStart && !customTarget) {
                    const links = await fetchLinkedPeople(startPerson.title);
                    
                    const randomResponse = await fetch(
                        `https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=10&format=json&origin=*`
                    );
                    const randomData = await randomResponse.json();
                    
                    if (randomData?.query?.random?.length) {
                        for (const page of randomData.query.random) {
                            if (!links.includes(page.title) && page.title !== startPerson.title) {
                                const targetDetails = await fetchPersonDetailsWithImage(page.title);
                                targetPerson = {
                                    title: page.title,
                                    description: targetDetails.description || "No description available",
                                    imageUrl: targetDetails.imageUrl
                                };
                                break;
                            }
                        }
                    }
                    
                    if (!targetPerson) {
                        const targetDetails = await fetchPersonDetailsWithImage("Albert Einstein");
                        targetPerson = {
                            title: "Albert Einstein", 
                            description: targetDetails.description || "Theoretical physicist",
                            imageUrl: targetDetails.imageUrl
                        };
                    }
                } else if (!customStart && customTarget) {
                    const links = await fetchLinkedPeople(targetPerson.title);
                    
                    const randomResponse = await fetch(
                        `https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=10&format=json&origin=*`
                    );
                    const randomData = await randomResponse.json();
                    
                    if (randomData?.query?.random?.length) {
                        for (const page of randomData.query.random) {
                            if (!links.includes(page.title) && page.title !== targetPerson.title) {
                                const startDetails = await fetchPersonDetailsWithImage(page.title);
                                startPerson = {
                                    title: page.title,
                                    description: startDetails.description || "No description available",
                                    imageUrl: startDetails.imageUrl
                                };
                                break;
                            }
                        }
                    }
                    
                    if (!startPerson) {
                        const startDetails = await fetchPersonDetailsWithImage("Marie Curie");
                        startPerson = {
                            title: "Marie Curie", 
                            description: startDetails.description || "Physicist and chemist",
                            imageUrl: startDetails.imageUrl
                        };
                    }
                }
                
                setStartPerson(startPerson);
                setTargetPerson(targetPerson);
                setCurrentPerson(startPerson);
                setPersonChain([startPerson]);
                
                const links = await fetchLinkedPeople(startPerson.title);
                setLinkedPeople(links);
                
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = setInterval(() => {
                    setSeconds(prev => prev + 1);
                }, 1000);
                
                if (inputRef.current) inputRef.current.focus();
                
                setCustomStart('');
                setCustomTarget('');
        } catch (error) {
                console.error("Error starting custom game:", error);
                setErrorMessage("Failed to start custom game. Please try again.");
            } finally {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error validating inputs:", error);
            setCustomError("An error occurred. Please try again.");
            setCustomLoading(false);
        }
    };
    
    return (
        <div className="wiki-connect">
            <div className="window-header">
                <div className="window-title">
                    <span>WikiConnect</span>
                </div>
                <div className="window-controls">
                    <button 
                        className="window-button close"
                        onClick={() => window.location.href = "/"}
                    ></button>
                </div>
            </div>
            
            <div className="menu-bar">
                <div className="menu-item">
                    <span>File</span>
                    <div className="menu-dropdown">
                        <div className="menu-option" onClick={startGame}>New Game</div>
                        <div className="menu-option" onClick={() => setShowCustomSetup(true)}>Custom Game</div>
                        <div className="menu-option" onClick={() => window.location.href = "/"}>Exit</div>
                    </div>
                </div>
                <div className="menu-item">
                    <span>Help</span>
                    <div className="menu-dropdown">
                        <div className="menu-option" onClick={() => setShowRules(true)}>How to Play</div>
                    </div>
                </div>
            </div>
            
            <div className="wiki-header">
                <div className="wiki-header-content">
                <h1 className="wiki-title">WikiConnect</h1>
                    <div className="wiki-stats">
                        <span className="stats-item">
                            Steps: <span className="stats-value">{personChain.length - 1}</span>
                        </span>
                        <span className="stats-divider">|</span>
                        <span className="stats-item">
                            Time: <span className="stats-value">{formatTime(seconds)}</span>
                        </span>
            </div>
                    </div>
                </div>
                
            <div className="game-container">
                {loading ? (
                    <div className="loading">Setting up your challenge...</div>
                ) : (
                    <div className="game-content">
                        <div className="person-connection-path">
                            <div className="person-card start-card">
                                <div className="card-label">Start</div>
                                <div className="card-content">
                                        <div className="person-image">
                                        {startPerson?.imageUrl ? (
                                            <img src={startPerson.imageUrl} alt={startPerson.title} />
                                        ) : (
                                            <div className="default-image">
                                                <span>{startPerson?.title?.[0] || '?'}</span>
                                        </div>
                                    )}
                                    </div>
                                    <div className="person-info">
                                        <div className="person-title">
                                            <a 
                                                href={getWikipediaUrl(startPerson?.title)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                {startPerson?.title}
                                            </a>
                                        </div>
                                        <div className="person-description">
                                            {startPerson?.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="connection-arrow">→</div>
                            
                            <div className="person-card current-card">
                                {currentPerson?.title === startPerson?.title ? (
                                    <div className="question-mark-container">
                                        <div className="question-mark">?</div>
                                    </div>
                                ) : (
                                    <>
                                <div className="card-label">Current</div>
                                <div className="card-content">
                                        <div className="person-image">
                                        {currentPerson?.imageUrl ? (
                                            <img src={currentPerson.imageUrl} alt={currentPerson.title} />
                                        ) : (
                                            <div className="default-image">
                                                <span>{currentPerson?.title?.[0] || '?'}</span>
                                        </div>
                                    )}
                                    </div>
                                    <div className="person-info">
                                        <div className="person-title">
                                            <a 
                                                href={getWikipediaUrl(currentPerson?.title)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                            {currentPerson?.title}
                                            </a>
                                        </div>
                                        <div className="person-description">
                                            {currentPerson?.description}
                                        </div>
                                    </div>
                                </div>
                                    </>
                                )}
                            </div>
                            
                            <div className="connection-arrow">→</div>
                            
                            <div className="person-card target-card">
                                <div className="card-label">Target</div>
                                <div className="card-content">
                                        <div className="person-image">
                                        {targetPerson?.imageUrl ? (
                                            <img src={targetPerson.imageUrl} alt={targetPerson.title} />
                                        ) : (
                                            <div className="default-image">
                                                <span>{targetPerson?.title?.[0] || '?'}</span>
                                        </div>
                                    )}
                                    </div>
                                    <div className="person-info">
                                        <div className="person-title">
                                            <a 
                                                href={getWikipediaUrl(targetPerson?.title)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                {targetPerson?.title}
                                            </a>
                                        </div>
                                        <div className="person-description">
                                            {targetPerson?.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {gameComplete ? (
                            <div className="game-complete">
                                <h2>Success! Connection Complete</h2>
                                <div className="word-chain-display">
                                    {personChain.map((person, index) => (
                                        <span key={index}>
                                            {person.title}
                                            {index < personChain.length - 1 && <span className="chain-arrow">→</span>}
                                        </span>
                                    ))}
                                </div>
                                <p>Steps: {personChain.length - 1}</p>
                                <p>Time: {formatTime(seconds)}</p>
                                <div className="complete-buttons">
                                    <button onClick={startGame}>Play Again</button>
                                    <button onClick={shareScore}>Share Score</button>
                                </div>
                            </div>
                        ) : (
                            <div className="word-chain-container">
                                <div className="word-chain-section">
                                    <h3>Your Connection Chain</h3>
                                    <div className="word-chain">
                                        {personChain.map((person, index) => (
                                            <React.Fragment key={index}>
                                                <div className="chain-word">
                                                {person.title}
                                            </div>
                                                {index < personChain.length - 1 && (
                                                    <div className="chain-arrow">→</div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="input-section">
                                    <label>Enter a person connected to {currentPerson?.title}</label>
                                    
                                    <form onSubmit={handleFormSubmit}>
                                    <div className="input-field">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={userInput}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Type a connected person's name..."
                                            disabled={loading || gameComplete}
                                        />
                                        
                                        {suggestions.length > 0 && (
                                            <div className="suggestions">
                                                {suggestions.map((suggestion, index) => (
                                                    <div 
                                                        key={index}
                                                            className={`suggestion ${userInput === suggestion ? 'selected' : ''}`}
                                                        onClick={() => handleSelectSuggestion(suggestion)}
                                                    >
                                                            <span className="suggestion-text">{suggestion}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="button-container">
                                    <button 
                                                type="submit"
                                            className="submit-button"
                                            disabled={!userInput || loading}
                                        >
                                            Submit Person
                                        </button>
                                        <button 
                                                type="button"
                                            className="del-button"
                                            onClick={goBack}
                                            disabled={personChain.length <= 1 || loading}
                                        >
                                            ← Back
                                        </button>
                                        </div>
                                    </form>

                                        {errorMessage && (
                                        <div className="error-message">{errorMessage}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {showRules && (
                    <div className="rules-modal">
                        <div className="rules-content">
                            <h2>How to Play WikiConnect</h2>
                            <p>Connect historical figures through Wikipedia page links in as few steps as possible.</p>
                            <ol>
                                <li>You start with a random historical figure</li>
                                <li>Your goal is to reach the target person</li>
                                <li>You can only navigate through people who are linked on the current person's Wikipedia page</li>
                                <li>Type the name of a connected person to add them to your chain</li>
                                <li>Try to reach the target in as few steps as possible</li>
                            </ol>
                            <button onClick={() => setShowRules(false)}>Close</button>
                        </div>
                    </div>
                )}
                
                {showCustomSetup && (
                    <div className="rules-modal">
                        <div className="custom-game-content">
                            <h2>Custom Game Setup</h2>
                            <p>Create your own WikiConnect challenge! Leave fields blank for random selection.</p>
                            
                            <div className="custom-form">
                                <div className="custom-input-group">
                                    <label>Start Person:</label>
                                    <input 
                                        type="text" 
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        placeholder="e.g. Albert Einstein"
                                        disabled={customLoading}
                                    />
                                </div>
                                
                                <div className="custom-input-group">
                                    <label>Target Person:</label>
                                    <input 
                                        type="text" 
                                        value={customTarget}
                                        onChange={(e) => setCustomTarget(e.target.value)}
                                        placeholder="e.g. Marie Curie"
                                        disabled={customLoading}
                                    />
                                </div>
                                
                                {customError && (
                                    <div className="custom-error">{customError}</div>
                                )}
                                
                                <div className="custom-buttons">
                                    <button 
                                        onClick={startCustomGame}
                                        disabled={customLoading}
                                    >
                                        {customLoading ? "Validating..." : "Start Game"}
                                    </button>
                                    <button 
                                        onClick={() => setShowCustomSetup(false)}
                                        disabled={customLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WikiConnect; 