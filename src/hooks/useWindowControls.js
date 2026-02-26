import { useState, useCallback } from 'react';

const useWindowControls = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [animState, setAnimState] = useState(null);

    const handleGreen = useCallback(() => {
        if (isExpanded) {
            setAnimState('restoring');
        } else {
            setAnimState('maximizing');
        }
    }, [isExpanded]);

    const handleYellow = useCallback(() => {
        if (isExpanded) {
            setAnimState('restoring');
        }
    }, [isExpanded]);

    const handleRed = useCallback(() => {
        setAnimState('minimizing');
    }, []);

    const onAnimationEnd = useCallback(() => {
        if (animState === 'minimizing') {
            setIsVisible(false);
        } else if (animState === 'maximizing') {
            setIsExpanded(true);
        } else if (animState === 'restoring') {
            setIsExpanded(false);
        }
        setAnimState(null);
    }, [animState]);

    return {
        isExpanded,
        isVisible,
        animState,
        onAnimationEnd,
        handleGreen,
        handleYellow,
        handleRed,
        TrafficLights: () => (
            <div className="traffic-lights">
                <button type="button" className="traffic-btn red" onClick={handleRed} aria-label="Hide window"></button>
                <button type="button" className="traffic-btn yellow" onClick={handleYellow} aria-label="Restore window size"></button>
                <button type="button" className="traffic-btn green" onClick={handleGreen} aria-label="Toggle expanded window"></button>
            </div>
        )
    };
};

export default useWindowControls;