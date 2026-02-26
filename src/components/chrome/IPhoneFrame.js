import React, { useState, useEffect } from 'react';
import './IPhoneFrame.css';

const IPhoneFrame = ({ children, activeSection, setActiveSection, toggleShell }) => {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';

            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;

            setTime(`${hours}:${minutes} ${ampm}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="iphone-container">
            <div className="iphone-body">
                {/* Physical Power / Sleep-Wake Button */}
                <div
                    className="iphone-power-button"
                    onClick={toggleShell}
                    title="Power off"
                />

                <div className="iphone-top-bezel">
                    <div className="iphone-camera"></div>
                    <div className="iphone-speaker"></div>
                    <div className="iphone-sensor"></div>
                </div>

                <div className="iphone-screen">
                    <div className="ios7-wallpaper">
                        {/* iOS 7 Status Bar */}
                        <div className="ios-status-bar">
                            <div className="status-left">
                                <span className="signal-dots">
                                    <span className="dot fill"></span>
                                    <span className="dot fill"></span>
                                    <span className="dot fill"></span>
                                    <span className="dot fill"></span>
                                    <span className="dot empty"></span>
                                </span>
                                <span className="carrier" style={{ marginLeft: "4px" }}>Sarvagya</span>
                            </div>
                            <div className="status-center">
                            </div>
                            <div className="status-right" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="time">{time}</span>
                                <span className="battery-icon"></span>
                            </div>
                        </div>

                        <div className="iphone-screen-content">
                            {children}
                        </div>
                    </div>
                </div>

                <div className="iphone-bottom-bezel">
                    <div className="iphone-home-button" onClick={() => activeSection !== 'Home' && setActiveSection('Home')}>
                        <div className="iphone-home-square"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IPhoneFrame;
