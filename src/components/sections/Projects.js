// src/components/sections/Projects.js
import React from 'react';
import './SectionStyles.css';
import useWindowControls from '../../hooks/useWindowControls';

const Projects = () => {
    const { isExpanded, isVisible, animState, onAnimationEnd, TrafficLights } = useWindowControls();

    const projects = [
        {
            title: "os32",
            technologies: ["OS", "JavaScript", "React", "RESTful API", "Python", "Firebase"],
            description: "Retro-themed emulated operating system powered by Node.js, React, Firebase, and RESTful APIs. Features a file system, terminal, internet browser, and various applications/games.",
            link: "https://os32.vercel.app"
        },
        {
            title: "AI Brand Semantics Analyzer",
            technologies: ["Node.js", "Python", "xAPI", "Grok LLM", "React"],
            description: "Full stack app powered by Node.js, Python, xAPI, Grok LLM and React to track and analyze brand performance on the X platform",
            link: "#"
        },
        {
            title: "Sales Ordering System",
            technologies: ["Full Stack", "Database", "API"],
            description: "Full stack product ordering system that streamlines the entire order management process from inception to fulfillment.",
            link: "#"
        },
        {
            title: "Stock Prediction App",
            technologies: ["Python", "ML", "NLP"],
            description: "Sentiment Analysis Application which forecast stock trajectories by interpreting media headlines.",
            link: "#"
        },
        {
            title: "TutorOne",
            technologies: ["Flutter", "ML", "OCR"],
            description: "Flutter Mobile application which optimizes Optical Character Recognition to facilitate improvement of legible alphabet writing skills in children",
            link: "https://github.com/som1shi/TutorOne"
        },
        {
            title: "Haunted Hallows: AR Video Game",
            technologies: ["Flutter", "Google ML", "AR"],
            description: "Halloween Themed Flutter Game which used Google ML technology to categorize real life objects",
            link: "#"
        },
        {
            title: "Secure File Sharing System",
            technologies: ["Go", "Cryptography"],
            description: "A Go based secure file storage and sharing system, which ensures confidentiality and integrity through Incorporated cryptographic principles",
            link: "#"
        },
        {
            title: "Discord Bot",
            technologies: ["Discord API", "Python"],
            description: "Chatbot utilizing various APIs to provide platitude of text-based information using the Discord platform",
            link: "https://github.com/som1shi/Optima"
        },
        {
            title: "MEGAlib Conversion Project",
            technologies: ["CMake", "Data Analysis"],
            description: "Highly modular data analysis library encompassing of approximately 1000 source files upgraded to CMake build services.",
            link: "https://megalibtoolkit.com/home.html"
        }
    ];

    if (!isVisible) return null;

    return (
        <div className={`section projects ${isExpanded ? 'expanded' : ''} ${animState || ''}`} onAnimationEnd={onAnimationEnd}>
            <div className="section-header">
                <TrafficLights />
                <h2>projects</h2>
            </div>
            <div className="section-content">
                {projects.map((project, index) => (
                    <div key={index} className="project-item">
                        <h3>{project.title}</h3>
                        <div className="technologies">
                            {project.technologies.map((tech, i) => (
                                <span key={i} className="tech-tag">{tech}</span>
                            ))}
                        </div>
                        <p className="description">{project.description}</p>
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                            View Project →
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Projects;
