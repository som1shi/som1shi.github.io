// src/components/MainSection.js
import React from 'react';
import Landing from './sections/Landing';
import About from './sections/About';
import Experiences from './sections/Experiences';
import Projects from './sections/Projects';
import Research from './sections/Research';
import Contact from './sections/Contact';
import Misc from './sections/Misc';

const MainSection = ({ activeSection }) => {
    switch (activeSection) {
        case 'Home':
            return <Landing />;
        case 'About':
            return <About />;
        case 'Experiences':
            return <Experiences />;
        case 'Projects':
            return <Projects />;
        case 'Research':
            return <Research />;
        case 'Contact':
            return <Contact />;
        case 'Misc':
            return <Misc />;
        default:
            return <Landing />;
    }
};

export default MainSection;
