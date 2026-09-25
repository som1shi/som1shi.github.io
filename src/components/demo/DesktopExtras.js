import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { games, photos } from '../../content/portfolioContent';
import Contact from '../sections/Contact';
import DesktopAppWindow from './DesktopAppWindow';
import DesktopGamePreviews from './DesktopGamePreviews';
import { WeatherWidget } from './DesktopWidgets';

const DesktopExtras = () => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (!selectedPhoto) return undefined;
    const close = (event) => {
      if (event.key === 'Escape') setSelectedPhoto(null);
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [selectedPhoto]);

  return (
    <>
      <section id="photos" className="desktop-story desktop-photo-library" aria-label="Photos">
        <div className="photos-split">
          <WeatherWidget />
          <DesktopAppWindow app="photos">
            <div className="desktop-photo-grid" role="region" aria-label="Photo library" data-reveal>
              {photos.map((photo) => (
                <button type="button" aria-label={`Open photo ${photo.id}`} onClick={() => setSelectedPhoto(photo)} key={photo.id}>
                  <img
                    src={photo.thumb}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={(event) => event.currentTarget.classList.add('is-loaded')}
                  />
                </button>
              ))}
            </div>
          </DesktopAppWindow>
        </div>
      </section>

      <section id="play" className="desktop-story" aria-label="Games">
        <DesktopAppWindow app="playground">
          <DesktopGamePreviews games={games} />
        </DesktopAppWindow>
      </section>

      <section id="contact" className="desktop-story desktop-contact-section" aria-label="Contact" data-reveal>
        <Contact desktop />
      </section>

      {selectedPhoto && (
        <div className="desktop-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setSelectedPhoto(null)}>
          <button type="button" aria-label="Close photo viewer" onClick={() => setSelectedPhoto(null)}><FaTimes /></button>
          <img
            src={selectedPhoto.src}
            alt={selectedPhoto.alt}
            decoding="async"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default DesktopExtras;
