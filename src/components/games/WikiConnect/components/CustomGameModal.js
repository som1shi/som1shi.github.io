import React from 'react';

export const CustomGameModal = ({ 
    customStart, 
    setCustomStart, 
    customTarget, 
    setCustomTarget,
    customError,
    customLoading,
    startCustomGame,
    onClose
}) => {
    return (
        <div className="rules-modal">
            <div className="custom-game-content">
                <h2>Custom Game Setup</h2>
                <p>Create your own WikiConnect challenge! Leave fields blank for random selection.</p>
                
                <div className="custom-form">
                    <div className="custom-input-group">
                        <label>Start Person:</label>
                        <input 
                            type="text" 
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            placeholder="e.g. Albert Einstein"
                            disabled={customLoading}
                        />
                    </div>
                    
                    <div className="custom-input-group">
                        <label>Target Person:</label>
                        <input 
                            type="text" 
                            value={customTarget}
                            onChange={(e) => setCustomTarget(e.target.value)}
                            placeholder="e.g. Marie Curie"
                            disabled={customLoading}
                        />
                    </div>
                    
                    {customError && (
                        <div className="custom-error">{customError}</div>
                    )}
                    
                    <div className="custom-buttons">
                        <button 
                            onClick={startCustomGame}
                            disabled={customLoading}
                        >
                            {customLoading ? "Validating..." : "Start Game"}
                        </button>
                        <button 
                            onClick={onClose}
                            disabled={customLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 