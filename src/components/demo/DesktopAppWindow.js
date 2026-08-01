import React, { useState } from 'react';
import {
  FaBookOpen,
  FaBriefcase,
  FaCodeBranch,
  FaCommentDots,
  FaFilm,
  FaFlask,
  FaGamepad,
  FaImages,
  FaStickyNote,
} from 'react-icons/fa';

const apps = {
  about: { title: 'About Me', Icon: FaStickyNote },
  projects: { title: 'Projects', Icon: FaCodeBranch },
  research: { title: 'Research', Icon: FaFlask },
  experience: { title: 'Experience', Icon: FaBriefcase },
  photos: { title: 'Photos', Icon: FaImages },
  playground: { title: 'Playground', Icon: FaGamepad },
  contact: { title: 'Contact', Icon: FaCommentDots },
  goodreads: { title: 'Goodreads', Icon: FaBookOpen },
  letterboxd: { title: 'Letterboxd', Icon: FaFilm },
};

const DesktopAppWindow = ({ app, children }) => {
  const [windowState, setWindowState] = useState('default');
  const { title, Icon } = apps[app];

  return (
    <div
      className={`desktop-app-window desktop-app-window-${app} is-${windowState}`}
      data-window-state={windowState}
      role="group"
      aria-label={`${title} app window`}
    >
      <header className="desktop-app-titlebar">
        <div className="desktop-traffic-lights" role="group" aria-label={`${title} window controls`}>
          <button type="button" className="desktop-traffic-light traffic-red" aria-label={`Reset ${title} window`} onClick={() => setWindowState('default')}><span aria-hidden="true">×</span></button>
          <button type="button" className="desktop-traffic-light traffic-yellow" aria-label={`Collapse ${title} window`} aria-pressed={windowState === 'compact'} onClick={() => setWindowState(windowState === 'compact' ? 'default' : 'compact')}><span aria-hidden="true">−</span></button>
          <button type="button" className="desktop-traffic-light traffic-green" aria-label={`Expand ${title} window`} aria-pressed={windowState === 'expanded'} onClick={() => setWindowState(windowState === 'expanded' ? 'default' : 'expanded')}><span aria-hidden="true">↗</span></button>
        </div>
        <div className="desktop-app-title"><Icon aria-hidden="true" /><span>{title}</span></div>
        <span className="desktop-window-state" aria-hidden="true">{windowState === 'compact' ? 'Collapsed' : windowState === 'expanded' ? 'Expanded' : ''}</span>
      </header>
      <div className="desktop-app-window-content" aria-hidden={windowState === 'compact'}>
        {children}
      </div>
    </div>
  );
};

export default DesktopAppWindow;
