import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ setActiveSection }) => {
    const [activeSection, setActiveSectionState] = useState("Home");
    const handleSectionClick = (section) => {
        setActiveSection(section);
        setActiveSectionState(section);
      };

return (
    <div className="sidebar">
        {['Home', 'About', 'Experiences', 'Projects', 'Research', 'Contact'].map((section, index) => (
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