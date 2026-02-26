// src/components/sections/Experiences.js
import React from 'react';
import './SectionStyles.css';
import useWindowControls from '../../hooks/useWindowControls';

const Experiences = () => {
    const { isExpanded, isVisible, animState, onAnimationEnd, TrafficLights } = useWindowControls();

    const experiences = [
        {
            title: "Microsoft",
            role: "Software Engineer Intern",
            date: "Summer 2025",
            location: "Redmond, WA",
        },
        {
            title: "Bentley Systems",
            role: "Contract Software Developer",
            date: "Fall 2024",
            location: "Berkeley, CA",
        },
        {
            title: "SAP SE",
            role: "Development Intern",
            date: "Summer 2024",
            location: "Palo Alto, CA",
        },
        {
            title: "Posto-Social Inc.",
            role: "Software Engineer Intern",
            date: "Summer 2023",
            location: "Berkeley, CA",
        },
        {
            title: "Bin95 Industrial Training",
            role: "Senior Contract Developer",
            date: "2023",
            location: "Remote",
        },
        {
            title: "Taiyō.AI",
            role: "Contract Developer",
            date: "2023",
            location: "Remote",
        },
        {
            title: "Berkeley IT",
            role: "Student IT Technician",
            date: "2022",
            location: "Berkeley, CA",
        },
        {
            title: "Revocube Technologies Limited",
            role: "Software Developer Intern",
            date: "2022",
            location: "Lagos, Nigeria",
        }
    ];

    if (!isVisible) return null;

    return (
        <div className={`section experiences ${isExpanded ? 'expanded' : ''} ${animState || ''}`} onAnimationEnd={onAnimationEnd}>
            <div className="section-header">
                <TrafficLights />
                <h2>experiences</h2>
            </div>
            <div className="section-content">
                {experiences.map((exp, index) => (
                    <div key={index} className="experience-item">
                        <div className="experience-header">
                            <h3>{exp.title}</h3>
                            <span className="experience-date">{exp.date}</span>
                        </div>
                        <div className="experience-subheader">
                            <span className="organization">{exp.role}</span>
                            <span className="location">{exp.location}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Experiences;
