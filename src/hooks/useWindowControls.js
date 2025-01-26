import { useState } from 'react';

const useWindowControls = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const handleGreen = () => {
        setIsExpanded(!isExpanded);
    };

    const handleYellow = () => {
        if (isExpanded) {
            setIsExpanded(false);
        }
    };

    const handleRed = () => {
        setIsVisible(false);
    };

    return {
        isExpanded,
        isVisible,
        handleGreen,
        handleYellow,
        handleRed,
        TrafficLights: () => (
            <div className="traffic-lights">
                <button className="traffic-btn red" onClick={handleRed}></button>
                <button className="traffic-btn yellow" onClick={handleYellow}></button>
                <button className="traffic-btn green" onClick={handleGreen}></button>
            </div>
        )
    };
};

export default useWindowControls; 