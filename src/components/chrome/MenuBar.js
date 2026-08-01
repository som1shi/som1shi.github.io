import React, { useState, useEffect } from 'react';
import { FaApple, FaWifi, FaPowerOff } from 'react-icons/fa';
import { IoBatteryFullSharp } from 'react-icons/io5';
import './MenuBar.css';

const MenuBar = ({
    activeSection,
    compact = false,
    toggleShell,
    showPower = true,
    menuItems = [],
    onSectionSelect,
    onHomeSelect,
}) => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const opts = { weekday: 'short', month: 'short', day: 'numeric' };
            const date = now.toLocaleDateString('en-US', opts);
            const clock = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
            setTime(`${date}  ${clock}`);
        };
        updateClock();
        const id = setInterval(updateClock, 10000);
        return () => clearInterval(id);
    }, []);

    return (
        <header className={`macos-menubar${compact ? ' is-compact' : ''}`}>
            <div className="menubar-left">
                <span className="menubar-apple" aria-hidden="true"><FaApple /></span>
                {onHomeSelect ? (
                    <button
                        className="menubar-appname menubar-appname-button"
                        type="button"
                        aria-label="Sarvagya, Home"
                        aria-current={activeSection === 'Home' ? 'location' : undefined}
                        onClick={onHomeSelect}
                    >
                        Sarvagya
                    </button>
                ) : (
                    <span className="menubar-appname">Sarvagya</span>
                )}
                {menuItems.length ? (
                    <nav className="menubar-navigation" aria-label="Portfolio navigation">
                        {menuItems.map(({ id, label }) => (
                            <button
                                key={id}
                                className="menubar-menu-item"
                                type="button"
                                aria-current={activeSection === id ? 'location' : undefined}
                                onClick={() => onSectionSelect?.(id)}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                ) : (
                    <span className="menubar-section">{activeSection}</span>
                )}
            </div>
            <div className="menubar-right">
                <span className="menubar-icon"><FaWifi /></span>
                <span className="menubar-icon menubar-battery"><IoBatteryFullSharp /></span>
                {showPower && (
                    <button className="menubar-power" type="button" onClick={toggleShell} aria-label="Shut Down">
                        <FaPowerOff />
                    </button>
                )}
                <span className="menubar-time">{time}</span>
            </div>
        </header>
    );
};

export default MenuBar;
