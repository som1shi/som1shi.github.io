import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

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

const DesktopGamePreviews = ({ games }) => (
  <div className="desktop-games-grid">
    {games.map((game) => (
      <a className={`desktop-game-preview desktop-game-preview-${game.id}`} href={game.route} key={game.id}>
        <div className="desktop-game-preview-canvas" aria-hidden="true">{previews[game.id]}</div>
        <footer>
          <div><strong>{game.title}</strong><span>{game.description}</span></div>
          <FaArrowRight aria-hidden="true" />
        </footer>
      </a>
    ))}
  </div>
);

export default DesktopGamePreviews;
