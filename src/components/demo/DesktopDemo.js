import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import MenuBar from '../chrome/MenuBar';
import DockNav from '../chrome/DockNav';
import DesktopPortfolio from './DesktopPortfolio';
import { GoldenGateWidget } from './DesktopWidgets';
import DesktopExtras from './DesktopExtras';
import DesktopMediaLibraries from './DesktopMediaLibraries';
import useRevealOnScroll from './useRevealOnScroll';
import { profile, socialLinks } from '../../content/portfolioContent';
import './DesktopDemo.css';
import './DesktopShell.css';
import './DesktopPortfolio.css';
import './DesktopWidgets.css';
import './DesktopMediaLibraries.css';
import './DesktopGamePreviews.css';
import './DesktopExtras.css';

const dockTargets = {
  Home: 'home',
  About: 'about',
  Projects: 'projects',
  Research: 'research',
  Experiences: 'experience',
  Photos: 'photos',
  Misc: 'play',
  Contact: 'contact',
};

const targetSections = Object.entries(dockTargets).reduce((items, [section, target]) => ({ ...items, [target]: section }), {});
const desktopSections = ['Home', 'About', 'Projects', 'Research', 'Experiences', 'Photos', 'Misc', 'Contact'];
const desktopExternalLinks = ['linkedin', 'github'];
// Menu labels match the dock tooltips and window titles so the chrome reads as one system.
const menuItems = [
  { id: 'About', label: 'Ideas' },
  { id: 'Projects', label: 'Projects' },
  { id: 'Research', label: 'Research' },
  { id: 'Experiences', label: 'Experience' },
  { id: 'Photos', label: 'Photos' },
  { id: 'Misc', label: 'Games' },
  { id: 'Contact', label: 'Contact' },
];

const menuStatusLinks = [
  { label: 'LinkedIn', url: socialLinks.linkedin, Icon: FaLinkedinIn },
  { label: 'GitHub', url: socialLinks.github, Icon: FaGithub },
];

const scrollDesktopTo = (container, target, frameRef, reduceMotion) => {
  cancelAnimationFrame(frameRef.current);
  const start = container.scrollTop;
  const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
  const end = Math.max(0, Math.min(container.scrollHeight - container.clientHeight, start + offset - 52));

  if (reduceMotion) {
    container.scrollTop = end;
    return;
  }

  const startedAt = performance.now();
  const duration = 520;
  const tick = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    container.scrollTop = start + (end - start) * eased;
    if (progress < 1) frameRef.current = requestAnimationFrame(tick);
  };

  frameRef.current = requestAnimationFrame(tick);
};

const DesktopDemo = ({ variant = 1 }) => {
  const [activeSection, setActiveSection] = useState('Home');
  const [isMenuCompact, setIsMenuCompact] = useState(false);
  const desktopRef = useRef(null);
  const scrollFrameRef = useRef(null);
  useRevealOnScroll(desktopRef);

  const handleSectionSelect = useCallback((section) => {
    setActiveSection(section);
    const desktop = desktopRef.current;
    const target = document.getElementById(dockTargets[section]);
    if (!desktop || !target) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    scrollDesktopTo(desktop, target, scrollFrameRef, reduceMotion);
  }, []);

  useEffect(() => {
    const desktop = desktopRef.current;
    const scrollFrame = scrollFrameRef;
    if (!desktop) return undefined;
    let frame;
    const updateActiveSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setIsMenuCompact(desktop.scrollTop > 40);
        const targets = Object.keys(targetSections)
          .map((id) => document.getElementById(id))
          .filter(Boolean);
        const current = targets.reduce((best, target) => {
          const distance = Math.abs(target.getBoundingClientRect().top - 72);
          return !best || distance < best.distance ? { target, distance } : best;
        }, null);
        if (current) setActiveSection(targetSections[current.target.id]);
      });
    };
    desktop.addEventListener('scroll', updateActiveSection, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame.current);
      desktop.removeEventListener('scroll', updateActiveSection);
    };
  }, []);

  return (
    <main ref={desktopRef} className={`desktop-demo desktop-demo-fork-${variant}`} aria-label="macOS desktop layout demo">
      <MenuBar
        activeSection={activeSection}
        compact={isMenuCompact}
        menuItems={menuItems}
        onHomeSelect={() => handleSectionSelect('Home')}
        onSectionSelect={handleSectionSelect}
        showPower={false}
        statusLinks={menuStatusLinks}
      />
      <div className="desktop-demo-workspace">
        <div className="desktop-hero-grid">
          <div id="home" className="desktop-demo-intro" data-reveal>
            <section className="desktop-intro-card">
              <span className="intro-kicker">{profile.location}</span>
              <div className="intro-copy">
                <h1>Hello</h1>
                <h2>I’m {profile.name}</h2>
                <p className="intro-discipline">
                  Software at <strong className="intro-accent intro-accent-vals" data-text="Vals AI">Vals AI</strong>
                </p>
                <p className="intro-school">
                  Electrical Engineering and Computer Sciences at University of California,{' '}
                  <strong className="intro-accent intro-accent-berkeley" data-text="Berkeley">Berkeley</strong>
                </p>
              </div>
              <div className="intro-marks" aria-hidden="true">
                <img className="intro-mark intro-mark-vals" src="/marks/vals-logo.png" alt="" />
                <img className="intro-mark intro-mark-berkeley" src="/marks/oski.png" alt="" />
              </div>
            </section>
          </div>
          <aside className="desktop-hero-rail" aria-label="Quick access">
            <section className="desktop-apps-widget" aria-label="Apps widget" data-reveal>
              <DockNav
                activeSection={activeSection}
                compact
                setActiveSection={handleSectionSelect}
                sectionIds={desktopSections}
                externalIds={desktopExternalLinks}
              />
            </section>
            <GoldenGateWidget />
          </aside>
        </div>

        <DesktopPortfolio />


        <DesktopMediaLibraries />
        <DesktopExtras />
      </div>
    </main>
  );
};

export default DesktopDemo;
