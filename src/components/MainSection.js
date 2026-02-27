// src/components/MainSection.js
import React from 'react';
import Landing from './sections/Landing';
import About from './sections/About';
import Experiences from './sections/Experiences';
import Projects from './sections/Projects';
import Research from './sections/Research';
import Contact from './sections/Contact';
import Misc from './sections/Misc';
import Photos from './sections/Photos';
import IOSGrid from './chrome/IOSGrid';
import IOSAppWrapper from './chrome/IOSAppWrapper';

const MainSection = ({ activeSection, isMobile, setActiveSection, toggleShell }) => {
    if (isMobile && activeSection === 'Home') {
        return <IOSGrid setActiveSection={setActiveSection} toggleShell={toggleShell} />;
    }

    const renderSection = () => {
        switch (activeSection) {
            case 'Home': return <Landing />;
            case 'About': return <About />;
            case 'Experiences': return <Experiences />;
            case 'Projects': return <Projects />;
            case 'Research': return <Research />;
            case 'Photos': return <Photos />;
            case 'Contact': return <Contact />;
            case 'Misc': return <Misc />;
            default: return <Landing />;
        }
    };

    if (isMobile && activeSection !== 'Home') {
        // Find title for the header
        const titleMap = {
            'About': 'About Me',
            'Experiences': 'Experiences',
            'Projects': 'Projects',
            'Research': 'Research',
            'Photos': 'Photos',
            'Contact': 'Contact',
            'Misc': 'Misc',
        };
        const title = titleMap[activeSection] || activeSection;

        return (
            <div className="native-mobile-app">
                <IOSAppWrapper title={title} activeSection={activeSection} onBack={() => setActiveSection('Home')}>
                    {renderSection()}
                </IOSAppWrapper>
            </div>
        );
    }

    return renderSection();
};

export default MainSection;
