import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
    FaHome,
    FaUserCircle,
    FaBriefcase,
    FaCodeBranch,
    FaFlask,
    FaGamepad,
    FaCommentDots,
    FaLinkedinIn,
    FaGithub,
    FaDesktop,
    FaStickyNote,
} from 'react-icons/fa';
import './DockNav.css';

const sections = [
    { id: 'Home', label: 'Finder', Icon: FaHome, gradient: 'linear-gradient(135deg, #2196f3 0%, #1a73e8 100%)' },
    { id: 'About', label: 'About Me', Icon: FaStickyNote, gradient: 'linear-gradient(135deg, #fdf5c9 0%, #f4e375 100%)' },
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

const BASE_SIZE = 50;
const MAX_SCALE = 1.8;
const MAGNIFY = MAX_SCALE - 1;
const SIGMA = 60;

function gaussian(dist) {
    return Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA));
}

const DockNav = ({ activeSection, setActiveSection }) => {
    const shelfRef = useRef(null);
    const itemRefs = useRef([]);
    const [scales, setScales] = useState([]);
    const animFrameRef = useRef(null);
    const isHovering = useRef(false);

    const computeScales = useCallback((mouseX) => {
        if (!shelfRef.current) return;
        const items = itemRefs.current;
        const newScales = [];
        for (let i = 0; i < items.length; i++) {
            const el = items[i];
            if (!el) { newScales.push(1); continue; }
            const rect = el.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            const dist = Math.abs(mouseX - center);
            newScales.push(1 + MAGNIFY * gaussian(dist));
        }
        setScales(newScales);
    }, []);

    const handleMouseMove = useCallback((e) => {
        isHovering.current = true;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(() => {
            computeScales(e.clientX);
        });
    }, [computeScales]);

    const handleMouseLeave = useCallback(() => {
        isHovering.current = false;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setScales([]);
    }, []);

    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    let refIdx = 0;
    return (
        <nav className="dock-nav" aria-label="macOS-style dock navigation">
            <div
                className="dock-shelf"
                ref={shelfRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {sections.map(({ id, label, Icon, gradient }, i) => {
                    const idx = refIdx++;
                    const isActive = activeSection === id;
                    const s = scales[idx] || 1;
                    const tileSize = BASE_SIZE * s;
                    const lift = (s - 1) * BASE_SIZE * 0.6;
                    return (
                        <button
                            key={id}
                            type="button"
                            ref={el => { itemRefs.current[idx] = el; }}
                            className={`dock-item ${isActive ? 'active' : ''}`}
                            aria-pressed={isActive}
                            onClick={() => setActiveSection(id)}
                            style={{
                                transform: `translateY(${-lift}px)`,
                            }}
                        >
                            <span
                                className="dock-icon-tile"
                                style={{
                                    background: gradient,
                                    width: tileSize,
                                    height: tileSize,
                                    fontSize: 24 * s,
                                }}
                                aria-hidden="true"
                            >
                                <Icon />
                            </span>
                            <span className="dock-tooltip">{label}</span>
                            {isActive && <span className="dock-dot" />}
                        </button>
                    );
                })}

                {(() => { refIdx++; return null; })()}
                <span className="dock-divider" aria-hidden="true" />

                {externalLinks.map(({ id, label, Icon, gradient, url }) => {
                    const idx = refIdx++;
                    const s = scales[idx] || 1;
                    const tileSize = BASE_SIZE * s;
                    const lift = (s - 1) * BASE_SIZE * 0.6;
                    return (
                        <a
                            key={id}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            ref={el => { itemRefs.current[idx] = el; }}
                            className="dock-item"
                            aria-label={`Open ${label}`}
                            style={{
                                transform: `translateY(${-lift}px)`,
                            }}
                        >
                            <span
                                className="dock-icon-tile"
                                style={{
                                    background: gradient,
                                    width: tileSize,
                                    height: tileSize,
                                    fontSize: 24 * s,
                                }}
                                aria-hidden="true"
                            >
                                <Icon />
                            </span>
                            <span className="dock-tooltip">{label}</span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
};

export default DockNav;
