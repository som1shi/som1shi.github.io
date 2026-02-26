import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection: controlledActiveSection, setActiveSection }) => {
    const [activeSectionState, setActiveSectionState] = useState("Home");
    const activeSection = controlledActiveSection || activeSectionState;

    const handleSectionClick = (section) => {
        setActiveSection(section);
        setActiveSectionState(section);
      };

return (
    <div className="sidebar">
        {['Home', 'About', 'Experiences', 'Projects', 'Research', 'Misc', 'Contact'].map((section, index) => (
            <button
            key={index}
            onClick={() => handleSectionClick(section)}
            className={`sidebar-button ${
              activeSection === section ? "active" : ""
            }`}
          >
            {section}
          </button>
        ))}
    </div>
);
}

export default Sidebar;