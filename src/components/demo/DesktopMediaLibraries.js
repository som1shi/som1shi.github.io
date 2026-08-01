import React, { useEffect, useRef, useState } from 'react';
import DesktopAppWindow from './DesktopAppWindow';

const DesktopMediaScene = React.lazy(() => import('./DesktopMediaScene'));

const books = [
  {
    title: 'The Design of Everyday Things',
    creator: 'Don Norman',
    cover: '#ded4ad',
    spine: '#c7bc92',
    pages: '#eee9d8',
    ink: '#26231d',
    size: [7.9, 0.62, 3.1],
    position: [-0.18, 1.46, 0],
    rotation: [0, -0.02, -0.012],
  },
  {
    title: 'The Creative Act',
    creator: 'Rick Rubin',
    cover: '#292724',
    spine: '#191816',
    pages: '#d8d0c1',
    ink: '#f0e9dc',
    size: [8.45, 0.7, 3.25],
    position: [0.2, 0, 0.08],
    rotation: [0, 0.025, 0.009],
  },
  {
    title: 'Dune',
    creator: 'Frank Herbert',
    cover: '#d98653',
    spine: '#b65e3b',
    pages: '#ead4b7',
    ink: '#281711',
    size: [8.1, 0.76, 3.15],
    position: [-0.08, -1.48, -0.06],
    rotation: [0, -0.016, -0.006],
  },
];

const films = [
  {
    title: 'Perfect Days',
    creator: 'Wim Wenders',
    src: '/photos/11.jpg',
    edge: '#d3d7d5',
    size: [2.42, 3.54, 0.19],
    position: [-3.28, -0.08, 0],
    rotation: [0.01, 0.13, -0.045],
  },
  {
    title: 'Arrival',
    creator: 'Denis Villeneuve',
    src: '/photos/24.JPG',
    edge: '#9ca3aa',
    size: [2.42, 3.54, 0.19],
    position: [0, 0.22, 0.3],
    rotation: [-0.015, -0.025, 0.018],
  },
  {
    title: 'The Social Network',
    creator: 'David Fincher',
    src: '/photos/17.jpg',
    edge: '#33465f',
    size: [2.42, 3.54, 0.19],
    position: [3.28, -0.1, -0.08],
    rotation: [0.008, -0.13, 0.04],
  },
];

const useSectionProgress = () => {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0.5);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const scroller = section?.closest('.desktop-demo');
    if (!section || !scroller) return undefined;

    if (!('IntersectionObserver' in window)) {
      setActive(true);
      setReady(true);
      return undefined;
    }

    const activeObserver = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { root: scroller, threshold: 0.01 },
    );
    const readyObserver = new IntersectionObserver(
      ([entry], observer) => {
        if (!entry.isIntersecting) return;
        setReady(true);
        observer.disconnect();
      },
      { root: scroller, rootMargin: '320px 0px', threshold: 0 },
    );
    activeObserver.observe(section);
    readyObserver.observe(section);
    return () => {
      activeObserver.disconnect();
      readyObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const scroller = section?.closest('.desktop-demo');
    if (!section || !scroller || !active) return undefined;
    let frame;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sectionBox = section.getBoundingClientRect();
        const scrollerBox = scroller.getBoundingClientRect();
        const distance = scrollerBox.bottom - sectionBox.top;
        const range = scrollerBox.height + sectionBox.height;
        setProgress(Math.max(0, Math.min(1, distance / range)));
      });
    };

    update();
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [active]);

  return [sectionRef, progress, active, ready];
};

const MediaFallback = ({ items }) => (
  <div className="desktop-media-fallback">
    {items.map((item) => (
      <article key={item.title}>
        <strong>{item.title}</strong>
        <span>{item.creator}</span>
      </article>
    ))}
  </div>
);

const SemanticMediaList = ({ items, label }) => (
  <ul className="desktop-media-semantic-list" aria-label={label}>
    {items.map((item) => <li key={item.title}>{item.title} by {item.creator}</li>)}
  </ul>
);

const GoodreadsStack = ({ items }) => {
  const [sectionRef, progress, active, ready] = useSectionProgress();

  return (
    <section ref={sectionRef} className="desktop-story desktop-media-library" aria-label="Goodreads library" data-media-active={active}>
      <DesktopAppWindow app="goodreads">
        <div className="desktop-media-stage desktop-book-stage">
          {ready ? (
            <React.Suspense fallback={<MediaFallback items={items} />}>
              <DesktopMediaScene
                fallback={<MediaFallback items={items} />}
                items={items}
                kind="books"
                progress={progress}
                active={active}
              />
            </React.Suspense>
          ) : <MediaFallback items={items} />}
          <SemanticMediaList items={items} label="Recent books" />
        </div>
      </DesktopAppWindow>
    </section>
  );
};

const LetterboxdLibrary = ({ items }) => {
  const [sectionRef, progress, active, ready] = useSectionProgress();

  return (
    <section ref={sectionRef} className="desktop-story desktop-media-library" aria-label="Letterboxd library" data-media-active={active}>
      <DesktopAppWindow app="letterboxd">
        <div className="desktop-media-stage desktop-poster-stage">
          {ready ? (
            <React.Suspense fallback={<MediaFallback items={items} />}>
              <DesktopMediaScene
                fallback={<MediaFallback items={items} />}
                items={items}
                kind="posters"
                progress={progress}
                active={active}
              />
            </React.Suspense>
          ) : <MediaFallback items={items} />}
          <div className="desktop-poster-index" aria-hidden="true">
            {items.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.creator}</span>
              </article>
            ))}
          </div>
          <SemanticMediaList items={items} label="Recently watched films" />
        </div>
      </DesktopAppWindow>
    </section>
  );
};

const DesktopMediaLibraries = () => (
  <>
    <GoodreadsStack items={books} />
    <LetterboxdLibrary items={films} />
  </>
);

export default DesktopMediaLibraries;
