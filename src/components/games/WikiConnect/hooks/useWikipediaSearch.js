import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for Wikipedia search functionality
 * @param {Array} linkedPeople - Array of linked people
 * @returns {Object} Search related state and handlers
 */
export const useWikipediaSearch = (linkedPeople) => {
    const [userInput, setUserInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    
    // Debounce function to limit API calls
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };
    
    // Memoized search function to prevent unnecessary re-creation
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
    
    const handleInputChange = useCallback((e) => {
        setUserInput(e.target.value);
        setSelectedIndex(-1);
        searchPeople(e.target.value);
    }, [searchPeople]);
    
    const handleSelectSuggestion = useCallback((suggestion) => {
        setUserInput(suggestion);
        setSuggestions([]);
    }, []);
    
    const handleKeyDown = useCallback((e) => {
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
                }
                break;
            case 'Escape':
                setSuggestions([]);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    }, [suggestions, selectedIndex, handleSelectSuggestion]);
    
    return {
        userInput,
        setUserInput,
        suggestions,
        selectedIndex,
        searchPeople,
        handleInputChange,
        handleSelectSuggestion,
        handleKeyDown,
        setSuggestions,
        setSelectedIndex
    };
}; 