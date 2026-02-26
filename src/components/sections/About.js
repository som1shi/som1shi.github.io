// src/components/sections/About.js
import React from 'react';
import './SectionStyles.css';
import useWindowControls from '../../hooks/useWindowControls';

const About = () => {
    const { isExpanded, isVisible, animState, onAnimationEnd, TrafficLights } = useWindowControls();

    if (!isVisible) return null;

    return (
        <div className={`section about ${isExpanded ? 'expanded' : ''} ${animState || ''}`} onAnimationEnd={onAnimationEnd}>
            <div className="section-header">
                <TrafficLights />
                <h2 className="window-title">About Me</h2>
            </div>
            <div className="section-content">
                <p>
                    I am currently pursuing my Bachelor's of Science degree in EECS at UC Berkeley.
                    I am dedicated to pushing boundaries and driving innovation in the world of technology.
                </p>
                <p>
                    I have been fortunate to be part of an exceptional academic environment that has
                    nurtured my passion for problem-solving and critical thinking. Through rigorous
                    coursework, I have developed a strong foundation in algorithms, data structures,
                    software development, and more. I am interested in Software Development, Machine
                    Learning and Artificial Intelligence and their real world applications.
                </p>
            </div>
        </div>
    );
};

export default About;
