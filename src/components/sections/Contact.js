// src/components/sections/Contact.js
import React, { useState, useEffect } from 'react';
import './Contact.css';
import useWindowControls from '../../hooks/useWindowControls';

const Contact = () => {
    const { isExpanded, isVisible, TrafficLights } = useWindowControls();
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showEmailContent, setShowEmailContent] = useState(false);
    const [sentMessage, setSentMessage] = useState(false);

    useEffect(() => {
        if (sentMessage) {
            setIsTyping(true);
            const typingTimer = setTimeout(() => {
                setIsTyping(false);
                setShowEmailContent(true);
            }, 1500);
            return () => clearTimeout(typingTimer);
        } else {
            setIsTyping(false);
            setShowEmailContent(false);
        }
    }, [sentMessage]);

    const handleSend = () => {
        if (message.toLowerCase().trim() === 'show email') {
            setSentMessage(true);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && message.toLowerCase().trim() === 'show email') {
            handleSend();
        }
    };

    const resetConversation = () => {
        setSentMessage(false);
        setShowEmailContent(false);
        setIsTyping(false);
    };

    if (!isVisible) return null;

    return (
        <div className={`contact-card ${isExpanded ? 'expanded' : ''}`}>
            <div className="contact-header">
                <TrafficLights />
                <h2>contact</h2>
            </div>
            <div className="contact-body">
                {sentMessage && (
                    <>
                        <div className="message-container">
                            <p className="sent-message">show email</p>
                        </div>
                        <div className="message-container left">
                            {isTyping ? (
                                <div className="typing-indicator" />
                            ) : showEmailContent && (
                                <>
                                    <p className="email-display">sarvagya [at] berkeley [dot] edu</p>
                                    <button className="reset-button" onClick={resetConversation}>
                                        Clear conversation
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
            <div className="message-bar">
                <input 
                    type="text" 
                    className="message-input" 
                    placeholder="Type 'show email' and press send"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button 
                    className={`send-button ${message.toLowerCase().trim() === 'show email' ? 'active' : ''}`}
                    onClick={handleSend}
                    disabled={message.toLowerCase().trim() !== 'show email'}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Contact;
