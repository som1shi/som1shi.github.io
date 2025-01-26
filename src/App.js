// src/App.js
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainSection from './components/MainSection';
import SocialLinks from './components/SocialLinks';
import EmojiBackground from './components/EmojiBackground';
import './App.css';

function App() {
    const [activeSection, setActiveSection] = useState('');

    return (
        <div className="app">
            <EmojiBackground />
            <Sidebar setActiveSection={setActiveSection} />
            <MainSection activeSection={activeSection} />
            <SocialLinks />
        </div>
    );
}

export default App;
