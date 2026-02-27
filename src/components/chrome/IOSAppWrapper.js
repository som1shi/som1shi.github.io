import React from 'react';
import './IOSAppWrapper.css';

const IOSAppWrapper = ({ title, activeSection, onBack, children }) => {
    // Map each section to its vibrant iOS gradient background
    const getHeaderStyle = () => {
        switch (activeSection) {
            case 'About': return { background: 'linear-gradient(180deg, #FFD700 0%, #FFC700 100%)', color: '#000' };
            case 'Experiences': return { background: 'linear-gradient(180deg, #E4E4E4 0%, #D1D1D1 100%)', color: '#000' };
            case 'Projects': return { background: 'linear-gradient(180deg, #FF5F57 0%, #E0443E 100%)', color: '#fff' };
            case 'Photos': return { background: '#f8f8f8', color: '#000' };
            case 'Research': return { background: 'linear-gradient(180deg, #9F74D1 0%, #8A63B4 100%)', color: '#fff' };
            case 'Misc': return { background: 'linear-gradient(180deg, #28C840 0%, #1DAA31 100%)', color: '#fff' };
            case 'Contact': return { background: '#f8f8f8', color: '#000' }; // Standard iOS grey for Messages
            default: return { background: '#f8f8f8', color: '#000' };
        }
    };

    const headerStyle = getHeaderStyle();

    // Override back button blue color to white if the header is colored
    const buttonStyle = headerStyle.color === '#fff' ? { color: '#fff' } : {};

    return (
        <div className="ios-app-container">
            <div className="ios-nav-bar" style={{ background: headerStyle.background }}>
                <button className="ios-back-button" style={buttonStyle} onClick={onBack}>
                    <span className="ios-back-chevron">‹</span> Home
                </button>
                <div className="ios-nav-title" style={{ color: headerStyle.color }}>{title}</div>
            </div>
            <div className="ios-app-scroll-content">
                {children}
            </div>
        </div>
    );
};

export default IOSAppWrapper;
