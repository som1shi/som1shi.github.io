import React from 'react';
import {
    FaUserCircle,
    FaBriefcase,
    FaCodeBranch,
    FaFlask,
    FaGamepad,
    FaCommentDots,
    FaPowerOff,
    FaGithub,
    FaLinkedinIn,
    FaDesktop
} from 'react-icons/fa';
import './IOSGrid.css';

const sections = [
    { id: 'About', label: 'About Me', Icon: FaUserCircle, gradient: 'linear-gradient(135deg, #ff9500 0%, #e08600 100%)' },
    { id: 'Experiences', label: 'Experiences', Icon: FaBriefcase, gradient: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)' },
    { id: 'Projects', label: 'Projects', Icon: FaCodeBranch, gradient: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)' },
    { id: 'Research', label: 'Research', Icon: FaFlask, gradient: 'linear-gradient(135deg, #af52de 0%, #8944ab 100%)' },
    { id: 'Misc', label: 'Misc', Icon: FaGamepad, gradient: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)' },
    { id: 'Contact', label: 'Contact', Icon: FaCommentDots, gradient: 'linear-gradient(135deg, #30d158 0%, #248a3d 100%)' },
];

const externalLinks = [
    { id: 'os32', label: 'os32', Icon: FaDesktop, gradient: 'linear-gradient(135deg, #007aff 0%, #0051d5 100%)', url: 'https://os32.vercel.app' },
    { id: 'linkedin', label: 'LinkedIn', Icon: FaLinkedinIn, gradient: 'linear-gradient(135deg, #0077b5 0%, #005e93 100%)', url: 'https://www.linkedin.com/in/sarvagyasomvanshi/' },
    { id: 'github', label: 'GitHub', Icon: FaGithub, gradient: 'linear-gradient(135deg, #333333 0%, #1a1a1a 100%)', url: 'https://github.com/som1shi' },
];

const IOSGrid = ({ setActiveSection, toggleShell }) => {
    return (
        <div className="ios-grid-container">
            {sections.map(({ id, label, Icon, gradient }) => (
                <div
                    key={id}
                    className="ios-app-icon-wrapper"
                    onClick={() => setActiveSection(id)}
                >
                    <div
                        className="ios-app-icon"
                        style={{ background: gradient }}
                    >
                        <Icon className="ios-app-svg" />
                    </div>
                    <span className="ios-app-label">{label}</span>
                </div>
            ))}
            {externalLinks.map(({ id, label, Icon, gradient, url }) => (
                <a
                    key={id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ios-app-icon-wrapper"
                    style={{ textDecoration: 'none' }}
                >
                    <div
                        className="ios-app-icon"
                        style={{ background: gradient }}
                    >
                        <Icon className="ios-app-svg" />
                    </div>
                    <span className="ios-app-label">{label}</span>
                </a>
            ))}
            <div
                className="ios-app-icon-wrapper"
                onClick={() => toggleShell()}
            >
                <div
                    className="ios-app-icon"
                    style={{ background: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)' }}
                >
                    <FaPowerOff className="ios-app-svg" />
                </div>
                <span className="ios-app-label">Shutdown</span>
            </div>
        </div>
    );
};

export default IOSGrid;
