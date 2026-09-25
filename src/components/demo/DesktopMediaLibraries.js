import React, { useEffect, useRef, useState } from 'react';
import DesktopAppWindow from './DesktopAppWindow';
import mediaLibrary from '../../content/mediaLibrary.json';

// Synced from Goodreads and Letterboxd by `npm run sync-media`.
const { books, films } = mediaLibrary;

// Letterboxd rows: pinned favourites, then recent likes, then everything else watched lately.
const FILM_GROUPS = [
  { key: 'holyGrail', label: 'Holy Grail', size: 4 },
  { key: 'loved', label: 'Loved Recently', size: 4 },
  { key: 'recent', label: 'Recently Watched', size: 4 },
];

const shortTitle = (title) => title.split(':')[0];

const formatDate = (iso) => (iso
  ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : null);

// Spine and ink colours sampled from the real cover, so each spine matches its book.
const useCoverColors = (src) => {
  const [colors, setColors] = useState(null);

  useEffect(() => {
    if (!src) return undefined;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 12;
        canvas.height = 18;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, 12, 18);
        const { data } = context.getImageData(0, 0, 12, 18);
        let r = 0; let g = 0; let b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2];
        }
        const count = data.length / 4;
        [r, g, b] = [r, g, b].map((channel) => Math.round((channel / count) * 0.82));
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (!cancelled) {
          setColors({
            '--spine': `rgb(${r}, ${g}, ${b})`,
            '--cover': `rgb(${Math.min(255, r + 18)}, ${Math.min(255, g + 18)}, ${Math.min(255, b + 18)})`,
            '--ink': luminance > 0.55 ? '#1d1b18' : '#f4efe4',
          });
        }
      } catch {
        // canvas unavailable; keep the neutral spine
      }
    };
    image.src = src;
    return () => { cancelled = true; };
  }, [src]);

  return colors ?? { '--spine': '#3a3530', '--cover': '#4a443d', '--ink': '#f4efe4' };
};

const useSectionActive = () => {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    if (!('IntersectionObserver' in window)) {
      setActive(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { root: section.closest('.desktop-demo'), threshold: 0.15 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return [sectionRef, active];
};

const Stars = ({ rating }) => (
  <span className="film-stars" aria-label={`${rating} out of 5 stars`}>
    {'★'.repeat(Math.floor(rating))}
    {rating % 1 ? '½' : ''}
  </span>
);

const StackedBook = ({ item, selected, onOpen }) => {
  const colors = useCoverColors(item.cover);

  return (
    <div className="stack-book" style={colors}>
      <button
        type="button"
        className="stack-book-object"
        aria-label={`Open ${item.title} by ${item.creator}`}
        aria-expanded={selected}
        onClick={(event) => onOpen(item, event.currentTarget)}
      >
        <span className="stack-face stack-face-spine" aria-hidden="true">
          <span className="stack-spine-author">{item.creator}</span>
          <span className="stack-spine-title">{shortTitle(item.title)}</span>
        </span>
        <span className="stack-face stack-face-top" aria-hidden="true">
          {item.cover && <img src={item.cover} alt="" loading="lazy" decoding="async" />}
        </span>
        <span className="stack-face stack-face-end" aria-hidden="true" />
      </button>
    </div>
  );
};

// The stack is three askew pairs; an index card tucked under each pair names it.
const BOOK_GROUPS = [
  { key: 'reading', label: 'Currently Reading' },
  { key: 'read', label: 'Recently Read' },
  { key: 'favorites', label: 'Favourites' },
];

const BookDetail = ({ item, onClose }) => {
  const closeRef = useRef(null);
  const colors = useCoverColors(item.cover);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="gr-detail" style={colors} role="region" aria-label={`${item.title} details`}>
      <button type="button" ref={closeRef} className="gr-back" onClick={onClose}>‹ My books</button>
      <div className="book-detail-object-wrap gr-detail-book">
        <div className="shelf-book-object" aria-hidden="true">
          <div className="shelf-book-front shelf-book-front-image">
            {item.cover && <img src={item.cover} alt="" />}
          </div>
          <div className="shelf-book-spine"><span>{shortTitle(item.title)}</span></div>
        </div>
      </div>
      <div className="gr-detail-body">
        <span className={`gr-shelf gr-shelf-${item.status === 'Reading' ? 'reading' : 'read'}`}>
          {item.status === 'Reading' ? 'Currently Reading' : 'Read'}
        </span>
        <h3>{shortTitle(item.title)}</h3>
        <p className="gr-author">by <span>{item.creator}</span></p>
        {item.rating ? (
          <p className="gr-rating">
            <span className="gr-stars" aria-label={`Rated ${item.rating} out of 5`}>
              {'★'.repeat(item.rating)}<span className="gr-stars-empty">{'★'.repeat(5 - item.rating)}</span>
            </span>
            <span className="gr-rating-label">My rating</span>
          </p>
        ) : null}
        <p className="gr-meta">
          {[item.pages && `${item.pages} pages`, item.published && `First published ${item.published}`].filter(Boolean).join(', ')}
          {item.readAt ? <><br />Read {formatDate(item.readAt)}</> : null}
        </p>
        {item.review && (
          <blockquote className="gr-review">
            <span className="gr-review-by">Sarvagya’s review</span>
            {item.review}
          </blockquote>
        )}
        <a className="gr-link" href={item.url} target="_blank" rel="noopener noreferrer">View on Goodreads</a>
      </div>
    </div>
  );
};

const PosterSheet = ({ item }) => (
  <div className="cinema-lightbox">
    <div className="real-poster-sheet" aria-hidden="true">
      {item.poster
        ? <img src={item.poster} alt="" loading="lazy" decoding="async" />
        : <span className="real-poster-fallback">{item.title}</span>}
    </div>
  </div>
);

const Poster = ({ item, onOpen }) => (
  <li className="retro-poster">
    <button
      type="button"
      className="retro-poster-button"
      aria-label={`Enlarge ${item.title} poster`}
      onClick={(event) => onOpen(item, event.currentTarget)}
    >
      <PosterSheet item={item} />
    </button>
  </li>
);

const PosterZoom = ({ item, onClose }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="lb-detail" role="region" aria-label={`${item.title} details`}>
      {item.poster && <div className="lb-backdrop" style={{ backgroundImage: `url(${item.poster})` }} aria-hidden="true" />}
      <button type="button" ref={closeRef} className="lb-back" onClick={onClose}>‹ Diary</button>
      <div className="lb-detail-poster">
        {item.poster && <img src={item.poster} alt={`${item.title} poster`} />}
      </div>
      <div className="lb-detail-body">
        <h3>{item.title} <span className="lb-year">{item.year}</span></h3>
        <div className="lb-diary">
          <span className="lb-diary-label">
            {item.watchedAt ? `${item.rewatch ? 'Rewatched' : 'Watched'} ${formatDate(item.watchedAt)}` : 'Pinned favourite'}
          </span>
          <span className="lb-diary-marks">
            {item.rating ? <Stars rating={item.rating} /> : null}
            {item.liked && <span className="lb-heart" aria-label="Liked">♥</span>}
            {item.rewatch && <span className="lb-rewatch" aria-label="Rewatch">↻</span>}
          </span>
        </div>
        <a className="lb-link" href={item.url} target="_blank" rel="noopener noreferrer">View on Letterboxd</a>
      </div>
    </div>
  );
};

// Shared open/close state for an enlargeable item that returns focus to what opened it.
const useSelection = () => {
  const [selected, setSelected] = useState(null);
  const openerRef = useRef(null);
  const open = (item, opener) => {
    openerRef.current = opener;
    setSelected(item);
  };
  const close = React.useCallback(() => {
    setSelected(null);
    requestAnimationFrame(() => openerRef.current?.focus({ preventScroll: true }));
  }, []);
  return [selected, open, close];
};

const GoodreadsShelf = ({ items }) => {
  const [sectionRef, active] = useSectionActive();
  const [selected, open, close] = useSelection();

  return (
    <section ref={sectionRef} className="desktop-story desktop-media-library" aria-label="Goodreads library" data-media-active={active}>
      <DesktopAppWindow app="goodreads">
        <div className="desktop-media-stage desktop-book-stage" data-book-open={Boolean(selected)}>
          <div className="book-stack-layer" aria-hidden={Boolean(selected)}>
            <ul className="book-stack" aria-label="Books">
              {BOOK_GROUPS.map((group) => {
                const pair = items.filter((item) => item.group === group.key);
                if (!pair.length) return null;
                return (
                  <li className={`stack-pair stack-pair-${group.key}`} key={group.key} aria-label={group.label}>
                    {pair.map((item) => (
                      <StackedBook
                        item={item}
                        key={item.title}
                        selected={selected?.title === item.title}
                        onOpen={open}
                      />
                    ))}
                    <span className="stack-shelf" aria-hidden="true">
                      <span className="stack-shelf-top" />
                      <span className="stack-shelf-end stack-shelf-end-right" />
                      <span className="stack-shelf-end stack-shelf-end-left" />
                      <span className="stack-shelf-front"><span>{group.label}</span></span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          {selected && <BookDetail item={selected} key={selected.title} onClose={close} />}
        </div>
      </DesktopAppWindow>
    </section>
  );
};

const LetterboxdLibrary = ({ items }) => {
  const [sectionRef, active] = useSectionActive();
  const [selected, open, close] = useSelection();

  return (
    <section ref={sectionRef} className="desktop-story desktop-media-library" aria-label="Letterboxd library" data-media-active={active}>
      <DesktopAppWindow app="letterboxd">
        <div className="desktop-media-stage desktop-poster-stage" data-poster-open={Boolean(selected)}>
          <div className="poster-wall" aria-hidden={Boolean(selected)}>
            {FILM_GROUPS.map(({ key, label, size }) => (
              <section className={`poster-group poster-group-${key}`} key={key} aria-label={label}>
                <div className="poster-marquee" aria-hidden="true"><span>{label}</span></div>
                <ul className="poster-row">
                  {items[key].map((item) => <Poster item={item} key={`${item.title}-${item.year}`} onOpen={open} />)}
                  {Array.from({ length: Math.max(0, size - items[key].length) }, (_, index) => (
                    <li className="retro-poster poster-empty" key={`empty-${index}`} aria-hidden="true">
                      <div className="cinema-lightbox"><div className="real-poster-sheet" /></div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {selected && <PosterZoom item={selected} key={selected.title} onClose={close} />}
        </div>
      </DesktopAppWindow>
    </section>
  );
};

const DesktopMediaLibraries = () => (
  <div className="desktop-story desktop-media-row">
    <GoodreadsShelf items={books} />
    <LetterboxdLibrary items={films} />
  </div>
);

export default DesktopMediaLibraries;
