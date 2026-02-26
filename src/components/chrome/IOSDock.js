import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
    FaUserCircle,
    FaBriefcase,
    FaCodeBranch,
    FaFlask,
    FaGamepad,
    FaCommentDots,
} from 'react-icons/fa';
import './IOSDock.css';

// Using a subset of sections or typical "dock" apps for iOS 7
const dockApps = [
    { id: 'Contact', label: 'Contact', Icon: FaCommentDots, gradient: 'linear-gradient(135deg, #30d158 0%, #248a3d 100%)' },
    { id: 'About', label: 'About Me', Icon: FaUserCircle, gradient: 'linear-gradient(135deg, #ff9500 0%, #e08600 100%)' },
    { id: 'Projects', label: 'Projects', Icon: FaCodeBranch, gradient: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)' },
    { id: 'Research', label: 'Research', Icon: FaFlask, gradient: 'linear-gradient(135deg, #af52de 0%, #8944ab 100%)' },
];

const IOSDock = ({ activeSection, setActiveSection }) => {
    return (
        <div className="ios-dock-container">
            <div className="ios-dock-glass">
                {dockApps.map(({ id, label, Icon, gradient }) => (
                    <div
                        key={id}
                        className="ios-dock-icon-wrapper"
                        onClick={() => setActiveSection(id)}
                    >
                        <div
                            className="ios-dock-icon"
                            style={{ background: gradient }}
                        >
                            <Icon className="ios-dock-svg" />
                        </div>
                        {/* iOS Dock mostly doesn't show labels, but leaving wrapper for flexibility */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IOSDock;
