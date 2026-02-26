import React from 'react';
import './LaptopFrame.css';

const LaptopFrame = ({ children, toggleShell }) => {
    return (
        <div className="macbook-container">
            <div className="macbook-lid">
                <div className="macbook-lid-outer">
                    <div className="macbook-lid-inner">
                        <div className="macbook-notch">
                            <div className="macbook-camera-housing">
                                <div className="macbook-camera-lens" />
                            </div>
                        </div>
                        <div className="macbook-screen">
                            <div className="macbook-screen-content">
                                {children}
                            </div>
                            <div className="macbook-screen-gloss" aria-hidden="true" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="macbook-bottom-bar" aria-hidden="true">
                <div className="macbook-bottom-notch" />
            </div>
            <div className="macbook-base" aria-hidden="true">
                <div className="macbook-base-surface">
                    <div className="macbook-keyboard-area">
                        {Array.from({ length: 5 }, (_, row) => (
                            <div key={row} className="macbook-key-row">
                                {Array.from({ length: row === 4 ? 8 : 13 }, (_, k) => (
                                    <div
                                        key={k}
                                        className={`macbook-key ${row === 4 && k === 3 ? 'macbook-key-space' : ''}`}
                                        onClick={row === 0 && k === 12 ? toggleShell : undefined}
                                        title={row === 0 && k === 12 ? "Power off" : ""}
                                        style={row === 0 && k === 12 ? { cursor: 'pointer' } : {}}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="macbook-trackpad" />
                </div>
            </div>
        </div>
    );
};

export default LaptopFrame;
