import React from 'react';
import './SectionStyles.css';
import useWindowControls from '../../hooks/useWindowControls';
import Icon from '../Icon';

const miscItems = [
    {
        title: "WordSweeper",
        icon: "💣",
        description: "The Classic Minesweeper game with a twist.",
        link: "/wordsweeper",
        category: "Games"
    },
    {
        title: "Schrödinger's Chess",
        icon: "♟️",
        description: "Chess where pieces exist in quantum superposition until observed.",
        link: "/quantum-chess",
        category: "Games"
    },
    {
        title: "Rotate Connect Four",
        icon: "🎲",
        description: "Connect Four with dice rolls and board rotation mechanics.",
        link: "/rotate-connect-four",
        category: "Games"
    },
    {
        title: "Macrodata Refinement",
        icon: "🔢",
        description: "Sort scary numbers in this Severance-inspired terminal game.",
        link: "/refiner",
        category: "Games"
    }
];

const Misc = () => {
    const { isExpanded, isVisible, TrafficLights } = useWindowControls();

    if (!isVisible) return null;

    return (
        <div className={`section misc ${isExpanded ? 'expanded' : ''}`}>
            <div className="section-header">
                <TrafficLights />
                <h2>misc</h2>
            </div>
            <div className="section-content">
                
                {miscItems.map((item, index) => (
                    <div key={index} className="misc-item" onClick={() => window.location.href = item.link}>
                        <div className="misc-icon">{item.icon}</div>
                        <div className="misc-content">
                            <h3>{item.title}</h3>
                            <span className="misc-category">{item.category}</span>
                            <p className="description">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Misc; 