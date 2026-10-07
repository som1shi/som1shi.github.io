import React from 'react';
import { FaBookOpen, FaFilm } from 'react-icons/fa';

const apps = {
  about: { title: 'Ideas', icon: '/icons/dock/notes.png' },
  projects: { title: 'Projects', icon: '/icons/dock/terminal.png' },
  research: { title: 'Research', icon: '/icons/dock/preview.png' },
  experience: { title: 'Experience', icon: '/icons/dock/pages.png' },
  photos: { title: 'Photos', icon: '/icons/dock/photos.png' },
  playground: { title: 'Games', icon: '/icons/dock/games.png' },
  contact: { title: 'Contact', icon: '/icons/dock/messages.png' },
  goodreads: { title: 'Goodreads', Icon: FaBookOpen },
  letterboxd: { title: 'Letterboxd', Icon: FaFilm },
};

const DesktopAppWindow = ({ app, children }) => {
  const { title, Icon, icon } = apps[app];

  return (
    <div
      className={`desktop-app-window desktop-app-window-${app}`}
      role="group"
      aria-label={`${title} app window`}
    >
      <header className="desktop-app-titlebar">
        <div className="desktop-app-title">
          {icon ? <img className="desktop-app-title-icon" src={icon} alt="" /> : <Icon aria-hidden="true" />}
          <span>{title}</span>
        </div>
      </header>
      <div className="desktop-app-window-content">
        {children}
      </div>
    </div>
  );
};

export default DesktopAppWindow;
