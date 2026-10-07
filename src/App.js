// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Minesweeper from './components/games/Minesweeper/Minesweeper';
import QuantumChess from './components/games/QuantumChess/QuantumChess';
import RotateConnectFour from './components/games/RotateConnectFour/RotateConnectFour';
import Refiner from './components/games/Refiner/Refiner';
import WikiConnect from './components/games/WikiConnect/WikiConnect';
import DesktopDemo from './components/demo/DesktopDemo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DesktopDemo />} />
        <Route path="/wordsweeper" element={<Minesweeper />} />
        <Route path="/quantum-chess" element={<QuantumChess />} />
        <Route path="/rotate-connect-four" element={<RotateConnectFour />} />
        <Route path="/refiner" element={<Refiner />} />
        <Route path="/wikiconnect" element={<WikiConnect />} />
      </Routes>
    </Router>
  );
}

export default App;
