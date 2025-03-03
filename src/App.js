// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainSection from './components/MainSection';
import Sidebar from './components/Sidebar';
import SocialLinks from './components/SocialLinks';
import EmojiBackground from './components/EmojiBackground';
import Minesweeper from './components/games/Minesweeper/Minesweeper';
import QuantumChess from './components/games/QuantumChess/QuantumChess';
import RotateConnectFour from './components/games/RotateConnectFour/RotateConnectFour';
import Refiner from './components/games/Refiner/Refiner';
import './App.css';

const Home = () => {
    const [activeSection, setActiveSection] = React.useState("Home");
    
    return (
        <div className="app">
            <EmojiBackground />
            <MainSection activeSection={activeSection} />
            <Sidebar setActiveSection={setActiveSection} />
            <SocialLinks />
        </div>
    );
};

function App() {
    return (
        <Router basename="/">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/wordsweeper" element={<Minesweeper />} />
                <Route path="/quantum-chess" element={<QuantumChess />} />
                <Route path="/rotate-connect-four" element={<RotateConnectFour />} />
                <Route path="/refiner" element={<Refiner />} />
            </Routes>
        </Router>
    );
}

export default App;
