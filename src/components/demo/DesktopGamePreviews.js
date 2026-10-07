import React, { useEffect, useRef, useState } from 'react';
import { socialLinks } from '../../content/portfolioContent';

const mineValues = {
  9: '1',
  10: '1',
  11: '1',
  13: 'mine',
  17: '1',
  18: '2',
  19: '2',
  20: '1',
  21: '1',
  25: '1',
  26: '2',
  27: 'mine',
  28: '1',
  33: '1',
  34: '2',
  35: '2',
};

const chessPieces = [
  '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
  '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
  '', '', '', '', '', '', '', '',
  '', '', '', '♟', '', '', '', '',
  '', '', '', '', '♙', '', '', '',
  '', '', '', '', '', '', '', '',
  '♙', '♙', '♙', '♙', '', '♙', '♙', '♙',
  '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖',
];

const connectPieces = {
  20: 'yellow',
  25: 'red',
  26: 'yellow',
  30: 'red',
  31: 'yellow',
  32: 'red',
  36: 'red',
  37: 'yellow',
  38: 'red',
  39: 'yellow',
};

const MinesPreview = () => (
  <div className="game-ui mines-preview">
    <div className="xp-bar"><span>WordSweeper</span><span>— □ ×</span></div>
    <div className="mine-status"><strong>010</strong><span>🙂</span><strong>023</strong></div>
    <div className="mine-grid">
      {Array.from({ length: 48 }, (_, index) => (
        <i className={mineValues[index] ? `is-open ${mineValues[index]}` : ''} key={index}>
          {mineValues[index] === 'mine' ? '✹' : mineValues[index]}
        </i>
      ))}
    </div>
  </div>
);

const ChessPreview = () => (
  <div className="game-ui chess-preview">
    <span className="quantum-state">SUPERPOSITION</span>
    <div className="chess-board">
      {chessPieces.map((piece, index) => <i key={index}>{piece}</i>)}
    </div>
  </div>
);

const ConnectPreview = () => (
  <div className="game-ui connect-preview">
    <div className="connect-title"><span>Rotate Connect Four</span><strong>↻ 90°</strong></div>
    <div className="connect-board">
      {Array.from({ length: 42 }, (_, index) => <i className={connectPieces[index] || ''} key={index} />)}
    </div>
  </div>
);

const RefinerPreview = () => (
  <div className="game-ui refiner-preview">
    <div className="refiner-heading"><strong>LUMON</strong><span>MACRODATA REFINEMENT</span></div>
    <div className="refiner-values">
      {['07', '31', '84', '12', '55', '09', '42', '73', '26', '91', '38', '04', '67', '18', '50', '23'].map((value) => <i key={value}>{value}</i>)}
    </div>
    <div className="refiner-status"><span>BIN 03</span><strong>42%</strong></div>
  </div>
);

const WikiPreview = () => (
  <div className="game-ui wiki-preview">
    <div className="wiki-toolbar"><span>‹  ›  ↻</span><strong>en.wikipedia.org</strong></div>
    <div className="wiki-page">
      <span>WIKIPEDIA</span>
      <h4>Ada Lovelace</h4>
      <i />
      <p>English mathematician and writer, chiefly known for her work on the Analytical Engine.</p>
      <div><u>Charles Babbage</u><u>Analytical Engine</u><u>Computing</u></div>
    </div>
  </div>
);

const previews = {
  wordsweeper: <MinesPreview />,
  'quantum-chess': <ChessPreview />,
  'rotate-connect-four': <ConnectPreview />,
  refiner: <RefinerPreview />,
  wikiconnect: <WikiPreview />,
};

const categories = {
  wordsweeper: 'Puzzle',
  'quantum-chess': 'Strategy',
  'rotate-connect-four': 'Board',
  refiner: 'Arcade',
  wikiconnect: 'Trivia',
};

const TERRA_URL = 'https://terrawebgpu.vercel.app/';

// os32 running live, scaled to cover the card like App Store artwork (non-interactive; the card is the link)
const Os32Cover = () => {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('ResizeObserver' in window)) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.max(width / 1280, height / 800));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <span className="appstore-os32-cover" ref={ref}>
      <iframe src={socialLinks.os32} title="os32" loading="lazy" tabIndex="-1" aria-hidden="true" style={{ transform: `translate(-50%, -50%) scale(${scale})` }} />
    </span>
  );
};

const FEATURES = [
  {
    id: 'os32',
    url: socialLinks.os32,
    eyebrow: 'Editors’ Choice',
    headline: 'A whole retro desktop, right in your browser',
    name: 'os32',
    subtitle: 'Web operating system',
    art: <Os32Cover />,
    icon: <img src="/projects/os32-icon.webp" alt="" />,
  },
  {
    id: 'terra',
    url: TERRA_URL,
    eyebrow: 'Now on WebGPU',
    headline: 'Endless worlds, generated as you fly',
    name: 'Terra',
    subtitle: 'Procedural world renderer',
    art: <img src="/projects/terra.webp" alt="" loading="lazy" decoding="async" />,
    icon: <img src="/projects/terra-icon.webp" alt="" />,
  },
];

// Games as the App Store: os32 is the featured story, the other games sit on a shelf of app icons.
const DesktopGamePreviews = ({ games }) => (
  <div className="appstore">
    <section className="appstore-features" aria-label="Featured">
      {FEATURES.map((feature) => (
        <a className={`appstore-feature appstore-feature-${feature.id}`} href={feature.url} target="_blank" rel="noopener noreferrer" key={feature.id}>
          <span className="appstore-feature-art" aria-hidden="true">{feature.art}</span>
          <span className="appstore-feature-head">
            <span className="appstore-feature-eyebrow">{feature.eyebrow}</span>
            <strong>{feature.headline}</strong>
          </span>
          <span className="appstore-lockup">
            <span className="appstore-lockup-icon" aria-hidden="true">{feature.icon}</span>
            <span className="appstore-lockup-text">
              <b>{feature.name}</b>
              <small>{feature.subtitle}</small>
            </span>
            <span className="appstore-lockup-get">Get</span>
          </span>
        </a>
      ))}
    </section>

    <section className="appstore-shelf" aria-label="More games">
      <header>
        <h4>More Games</h4>
      </header>
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            <a className="appstore-app" href={game.route}>
              <span className="appstore-icon" aria-hidden="true">{previews[game.id]}</span>
              <strong>{game.title}</strong>
              <span className="appstore-category">{categories[game.id] ?? 'Games'}</span>
              <span className="appstore-get">Get</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  </div>
);

export default DesktopGamePreviews;
