// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import './App.css';
import Sidebar from './components/Sidebar';
import MainSection from './components/MainSection';
import SocialLinks from './components/SocialLinks';
import EmojiBackground from './components/EmojiBackground';
import LaptopFrame from './components/chrome/LaptopFrame';
import IPhoneFrame from './components/chrome/IPhoneFrame';
import MenuBar from './components/chrome/MenuBar';
import DockNav from './components/chrome/DockNav';
import IOSDock from './components/chrome/IOSDock';
import Minesweeper from './components/games/Minesweeper/Minesweeper';
import QuantumChess from './components/games/QuantumChess/QuantumChess';
import RotateConnectFour from './components/games/RotateConnectFour/RotateConnectFour';
import Refiner from './components/games/Refiner/Refiner';
import WikiConnect from './components/games/WikiConnect/WikiConnect';

function App() {
  const [activeSection, setActiveSection] = useState("Home");
  const [isShellEnabled, setIsShellEnabled] = useState(true);
  const [isConfirmingShutdown, setIsConfirmingShutdown] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  const toggleShell = () => {
    if (isShellEnabled) {
      setIsConfirmingShutdown(true);
    } else {
      setIsShellEnabled(true);
    }
  };

  const confirmShutdown = () => {
    setIsConfirmingShutdown(false);
    setIsShellEnabled(false);
  };

  const cancelShutdown = () => {
    setIsConfirmingShutdown(false);
  };

  const renderShutdownModal = () => {
    if (!isConfirmingShutdown) return null;

    if (isMobile) {
      return (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#e5e5ea', width: '270px', borderRadius: '14px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            fontFamily: '-apple-system, sans-serif'
          }}>
            <div style={{ padding: '20px 15px', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#000' }}>Power Off</p>
              <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#000' }}>Are you sure you want to shut down?</p>
            </div>
            <button style={{
              padding: '12px', border: 'none', background: 'transparent',
              borderBottom: '1px solid rgba(0,0,0,0.1)', color: '#ff3b30',
              fontSize: '17px', fontWeight: '400', cursor: 'pointer'
            }} onClick={confirmShutdown}>Shut Down</button>
            <button style={{
              padding: '12px', border: 'none', background: 'transparent',
              color: '#007aff', fontSize: '17px', fontWeight: '600', cursor: 'pointer'
            }} onClick={cancelShutdown}>Cancel</button>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'transparent', zIndex: 9999,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '100px'
      }}>
        <div style={{
          backgroundColor: '#ececec', width: '260px', borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)', padding: '20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(0,0,0,0.1)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold', color: '#000', textAlign: 'center' }}>Are you sure you want to shut down your computer now?</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', width: '100%', justifyContent: 'center' }}>
            <button style={{
              padding: '4px 12px', border: '1px solid #c3c3c3', borderRadius: '4px',
              background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
              color: '#000', fontSize: '13px', cursor: 'pointer'
            }} onClick={cancelShutdown}>Cancel</button>
            <button style={{
              padding: '4px 12px', border: '1px solid #1c6ad6', borderRadius: '4px',
              background: 'linear-gradient(180deg, #5ba4fc 0%, #1771e8 100%)',
              color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer'
            }} onClick={confirmShutdown}>Shut Down</button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!isShellEnabled) {
      return (
        <div className="app">
          <button
            onClick={toggleShell}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 10,
              padding: '12px 20px',
              background: '#007aff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            Relaunch Device
          </button>
          <EmojiBackground />
          <MainSection activeSection={activeSection} />
          <Sidebar setActiveSection={setActiveSection} />
          <SocialLinks />
        </div>
      );
    }

    if (isMobile) {
      return (
        <IPhoneFrame activeSection={activeSection} setActiveSection={setActiveSection} toggleShell={toggleShell}>
          {renderShutdownModal()}
          <div className="iphone-main-layer">
            <MainSection activeSection={activeSection} isMobile={isMobile} setActiveSection={setActiveSection} toggleShell={toggleShell} />
          </div>
          <div className="iphone-dock-layer">
            <IOSDock
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
        </IPhoneFrame>
      );
    }

    return (
      <LaptopFrame toggleShell={toggleShell}>
        {renderShutdownModal()}
        <div className="laptop-menubar-slot">
          <MenuBar activeSection={activeSection} toggleShell={toggleShell} />
        </div>
        <div className="laptop-main-slot">
          <MainSection activeSection={activeSection} />
        </div>
        <div className="laptop-dock-slot">
          <DockNav
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
        <div className="laptop-mobile-sidebar-slot">
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
      </LaptopFrame>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            {isShellEnabled && <EmojiBackground />}
            {isShellEnabled ? (
              <div className="app">{renderContent()}</div>
            ) : (
              renderContent()
            )}
          </>
        } />
        <Route path="/wordsweeper" element={<Minesweeper />} />
        <Route path="/quantum-chess" element={<QuantumChess />} />
        <Route path="/rotate-connect-four" element={<RotateConnectFour />} />
        <Route path="/refiner" element={<Refiner />} />
        <Route path="/wikiconnect" element={<WikiConnect />} />
      </Routes>
    </Router >
  );
}

export default App;
