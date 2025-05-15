import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchRandomPeoplePair, fetchLinkedPeople, fetchPersonDetailsWithImage } from '../utils/wikipediaApi';

/**
 * Custom hook for managing game state
 * @returns {Object} Game state and handlers
 */
export const useGameState = () => {
    const [startPerson, setStartPerson] = useState(null);
    const [targetPerson, setTargetPerson] = useState(null);
    const [currentPerson, setCurrentPerson] = useState(null);
    const [personChain, setPersonChain] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gameActive, setGameActive] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [linkedPeople, setLinkedPeople] = useState([]);
    const [peopleCache, setPeopleCache] = useState({});
    
    const timerRef = useRef(null);
    
    /**
     * Handles successfully reaching the target
     */
    const handleSuccess = useCallback((person) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameComplete(true);
    }, []);
    
    /**
     * Starts a new game with optional custom parameters
     * @param {string} customStart - Optional custom start person
     * @param {string} customTarget - Optional custom target person
     */
    const startGame = useCallback(async (customStart, customTarget) => {
        setLoading(true);
        setGameActive(true);
        setGameComplete(false);
        setErrorMessage('');
        setSeconds(0);
        setPersonChain([]);
        
        try {
            let gameData;
            
            if (customStart || customTarget) {
                // Custom game setup
                gameData = await setupCustomGame(customStart, customTarget);
            } else {
                // Random game
                gameData = await fetchRandomPeoplePair();
            }
            
            setStartPerson(gameData.start);
            setTargetPerson(gameData.target);
            setCurrentPerson(gameData.start);
            setPersonChain([gameData.start]);
            
            const links = await fetchLinkedPeople(gameData.start.title);
            setLinkedPeople(links);
            
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error starting game:", error);
            setErrorMessage("Failed to start game. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);
    
    /**
     * Sets up a custom game with provided parameters
     * @param {string} customStart - Optional custom start person
     * @param {string} customTarget - Optional custom target person
     * @returns {Object} Game data with start and target persons
     */
    const setupCustomGame = async (customStart, customTarget) => {
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
        
        // If one parameter is provided but not the other, find a suitable counterpart
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
        } else if (customStart && customTarget) {
            // Both are provided, do nothing
        } else {
            // Neither are provided
            return await fetchRandomPeoplePair();
        }
        
        return { start: startPerson, target: targetPerson };
    };
    
    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);
    
    return {
        startPerson,
        targetPerson,
        currentPerson,
        personChain,
        loading,
        gameActive,
        gameComplete,
        seconds,
        errorMessage,
        linkedPeople,
        startGame,
        setStartPerson,
        setTargetPerson,
        setCurrentPerson,
        setPersonChain,
        setLoading,
        setGameActive,
        setGameComplete,
        setSeconds,
        setErrorMessage,
        setLinkedPeople,
        handleSuccess
    };
}; 