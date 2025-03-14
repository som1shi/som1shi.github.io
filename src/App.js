// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import MainSection from './components/MainSection';
import SocialLinks from './components/SocialLinks';
import EmojiBackground from './components/EmojiBackground';
import Minesweeper from './components/games/Minesweeper/Minesweeper';
import QuantumChess from './components/games/QuantumChess/QuantumChess';
import RotateConnectFour from './components/games/RotateConnectFour/RotateConnectFour';
import Refiner from './components/games/Refiner/Refiner';
import WikiConnect from './components/games/WikiConnect/WikiConnect';

function App() {
  const [activeSection, setActiveSection] = useState("Home");

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            <>
              <EmojiBackground />
              <Sidebar setActiveSection={setActiveSection} />
              <MainSection activeSection={activeSection} />
              <SocialLinks />
            </>
          } />
          <Route path="/wordsweeper" element={<Minesweeper />} />
          <Route path="/quantum-chess" element={<QuantumChess />} />
          <Route path="/rotate-connect-four" element={<RotateConnectFour />} />
          <Route path="/refiner" element={<Refiner />} />
          <Route path="/wikiconnect" element={<WikiConnect />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
