// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainSection from './components/MainSection';
import SocialLinks from './components/SocialLinks';
import EmojiBackground from './components/EmojiBackground';
import Minesweeper from './components/games/Minesweeper/Minesweeper';
import './App.css';

function App() {
    const [activeSection, setActiveSection] = useState('');

    return (
        <Router basename="/">
            <Routes>
                <Route path="/wordsweeper" element={<Minesweeper />} />
                <Route 
                    path="/" 
                    element={
                        <div className="app">
                            <EmojiBackground />
                            <Sidebar setActiveSection={setActiveSection} />
                            <MainSection activeSection={activeSection} />
                            <SocialLinks />
                        </div>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
