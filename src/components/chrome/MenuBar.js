import React, { useState, useEffect } from 'react';
import { FaApple, FaWifi, FaPowerOff } from 'react-icons/fa';
import { IoBatteryFullSharp } from 'react-icons/io5';
import './MenuBar.css';

const MenuBar = ({ activeSection, toggleShell }) => {
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
        <div className="macos-menubar" aria-hidden="true">
            <div className="menubar-left">
                <span className="menubar-apple"><FaApple /></span>
                <span className="menubar-appname">Sarvagya</span>
                <span className="menubar-section">{activeSection}</span>
            </div>
            <div className="menubar-right">
                <span className="menubar-icon"><FaWifi /></span>
                <span className="menubar-icon menubar-battery"><IoBatteryFullSharp /></span>
                <span className="menubar-icon" onClick={toggleShell} style={{ cursor: 'pointer', marginLeft: '6px' }} title="Shut Down"><FaPowerOff /></span>
                <span className="menubar-time">{time}</span>
            </div>
        </div>
    );
};

export default MenuBar;
