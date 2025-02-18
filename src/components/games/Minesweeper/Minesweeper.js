import React, { useState, useEffect } from 'react';
import { findSimilarWords, getRandomWord, hasWord } from '../../../services/embeddings';
import './Minesweeper.css';

const BOARD_SIZE = 8;
const MINES_COUNT = 8;

const Minesweeper = () => {
    const [board, setBoard] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const [flagMode, setFlagMode] = useState(false);
    const [minesLeft, setMinesLeft] = useState(MINES_COUNT);
    const [targetWord, setTargetWord] = useState('');
    const [customWord, setCustomWord] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [score, setScore] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [shareText, setShareText] = useState('');

    const handleCustomWordSubmit = async () => {
        try {
            if (!customWord.trim()) {
                alert('Please enter a word');
                return;
            }

            const wordExists = await hasWord(customWord);
            if (!wordExists) {
                alert('Word not found in dictionary!');
                return;
            }

            const similarWords = await findSimilarWords(customWord);
            if (!similarWords) {
                alert('Could not find similar words!');
                return;
            }

            startNewGame(customWord.toUpperCase());
            setShowCustomInput(false);
            setCustomWord('');
        } catch (error) {
            console.error('Error with custom word:', error);
            alert('Error processing word!');
        }
    };

    const startNewGame = async (word = null) => {
        try {
            const newTargetWord = word || await getRandomWord();
            if (newTargetWord === 'ERROR') {
                alert('Error starting game!');
                return;
            }

            setTargetWord(newTargetWord);
            const similarWords = await findSimilarWords(newTargetWord);
            if (!similarWords) {
                alert('Error finding similar words!');
                return;
            }

            createBoard(newTargetWord, similarWords);
            setGameOver(false);
            setWin(false);
            setMinesLeft(MINES_COUNT);
            if (!win) {
                setScore(0);
            }
        } catch (error) {
            console.error('Error starting new game:', error);
            alert('Error starting game!');
        }
    };

    const createBoard = (targetWord, similarWords) => {
        const newBoard = Array(BOARD_SIZE).fill().map(() => 
            Array(BOARD_SIZE).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
                word: ''
            }))
        );

        let minesPlaced = 0;
        while (minesPlaced < MINES_COUNT) {
            const x = Math.floor(Math.random() * BOARD_SIZE);
            const y = Math.floor(Math.random() * BOARD_SIZE);
            if (!newBoard[x][y].isMine) {
                newBoard[x][y].isMine = true;
                newBoard[x][y].word = targetWord;
                minesPlaced++;
            }
        }

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (!newBoard[i][j].isMine) {
                    let count = 0;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (i + di >= 0 && i + di < BOARD_SIZE && 
                                j + dj >= 0 && j + dj < BOARD_SIZE &&
                                newBoard[i + di][j + dj].isMine) {
                                count++;
                            }
                        }
                    }
                    newBoard[i][j].neighborMines = count;
                    if (count > 0) {
                        if (count === 1) newBoard[i][j].word = similarWords.level1[Math.floor(Math.random() * similarWords.level1.length)];
                        else if (count === 2) newBoard[i][j].word = similarWords.level2[Math.floor(Math.random() * similarWords.level2.length)];
                        else newBoard[i][j].word = similarWords.level3[Math.floor(Math.random() * similarWords.level3.length)];
                    }
                }
            }
        }

        setBoard(newBoard);
        setMinesLeft(MINES_COUNT);
    };

    useEffect(() => {
        startNewGame();
    }, []);


    const revealCell = (x, y) => {
        if (gameOver || win || board[x][y].isRevealed || board[x][y].isFlagged) return;

        const newBoard = [...board];
        if (board[x][y].isMine) {
            setGameOver(true);
            revealAllMines();
            setScore(0);
            return;
        }

        const revealEmpty = (i, j) => {
            if (i < 0 || i >= BOARD_SIZE || j < 0 || j >= BOARD_SIZE || 
                newBoard[i][j].isRevealed || newBoard[i][j].isFlagged) return;

            newBoard[i][j].isRevealed = true;
            setScore(prev => prev + 10);

            if (newBoard[i][j].neighborMines === 0) {
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        revealEmpty(i + di, j + dj);
                    }
                }
            }
        };

        revealEmpty(x, y);
        setBoard(newBoard);
        checkWin(newBoard);
    };

    const toggleFlag = (x, y) => {
        if (gameOver || win || board[x][y].isRevealed) return;

        const newBoard = [...board];
        newBoard[x][y].isFlagged = !newBoard[x][y].isFlagged;
        setBoard(newBoard);
        setMinesLeft(prev => newBoard[x][y].isFlagged ? prev - 1 : prev + 1);
    };

    const handleCellClick = (x, y, e) => {
        e.preventDefault();
        
        if (e.button === 2 || flagMode) {
            toggleFlag(x, y);
        } else if (e.button === 0) {
            revealCell(x, y);
        }
    };

    const revealAllMines = () => {
        const newBoard = board.map(row => 
            row.map(cell => ({
                ...cell,
                isRevealed: cell.isMine ? true : cell.isRevealed
            }))
        );
        setBoard(newBoard);
    };

    const checkWin = (currentBoard) => {
        const win = currentBoard.every(row => 
            row.every(cell => 
                (cell.isMine && !cell.isRevealed) || (!cell.isMine && cell.isRevealed)
            )
        );
        if (win) {
            setWin(true);
            setScore(prev => prev + 500);
        }
    };

    const generateShareText = () => {
        let text = `I scored ${score} in WordSweeper\n \n`;
        text += `🎯 Word: ${targetWord}\n`;

        for (let j = 0; j < BOARD_SIZE; j++) { 
            for (let i = 0; i < BOARD_SIZE; i++) {
                const cell = board[i][j];
                if (cell.isMine && (cell.isRevealed || gameOver)) {
                    text += '💣 ';
                } else if (cell.isRevealed) {
                    switch(cell.neighborMines) {
                        case 1: text += '🟦 ';
                            break;
                        case 2: text += '🟧 ';
                            break;
                        case 3: text += '🟥 ';
                            break;
                        default: text += '⬜ ';
                            break;
                    }
                } else if (cell.isFlagged) {
                    text += '🚩 ';
                } else {
                    text += '⬛ ';
                }
            }
            text += '\n';
        }
        
        text += `\nPlay at https://som1shi.github.io/wordsweeper`;
        return text;
    };

    const handleShare = async () => {
        const text = generateShareText();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'WordSweeper',
                    text: text
                });
            } catch (err) {
                copyToClipboard(text);
            }
        } else {
            copyToClipboard(text);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert('Result copied to clipboard!');
            })
            .catch(err => {
                console.log(err);
            });
    };

    return (
        <div className="minesweeper">
            <div className="window-header">
                <div className="window-title">
                    <span>💣</span>
                    <span>WordSweeper</span>
                </div>
                <div className="window-controls">
                    <button 
                        className="window-button close" 
                        onClick={() => window.location.href = "/"}
                    ></button>
                </div>
            </div>
            <div className="game-container">
                <div className="controls">
                    <button onClick={() => startNewGame()}>New Game</button>
                    <button onClick={() => setShowCustomInput(!showCustomInput)}>
                        Custom Word
                    </button>
                    <button 
                        onClick={() => setFlagMode(!flagMode)}
                        className={`flag-button ${flagMode ? 'active' : ''}`}
                    >
                        🚩
                    </button>
                    <button 
                        onClick={() => setShowInfo(!showInfo)}
                        className="info-button"
                    >
                        ℹ️
                    </button>
                    <button 
                        onClick={handleShare}
                        className="share-button"
                    >
                        Share 🔗
                    </button>
                </div>
                <div className="scoreboard">
                    <div className="score-total">
                        <span className="score-label">SCORE</span>
                        <span className="score-value">{score}</span>
                    </div>
                    <div className="score-display">
                        <span className="score-label">Target Word</span>
                        <span className="score-value">{targetWord}</span>
                    </div>
                    <div className="score-display">
                        <span className="score-label">Mines Left</span>
                        <span className="score-value">{minesLeft}</span>
                    </div>
                </div>
                {showCustomInput && (
                    <>
                        <div className="custom-word-overlay" onClick={() => setShowCustomInput(false)} />
                        <div className="custom-word-input">
                            <input
                                type="text"
                                value={customWord}
                                onChange={(e) => setCustomWord(e.target.value)}
                                placeholder="ENTER A WORD"
                                autoFocus
                            />
                            <button onClick={handleCustomWordSubmit}>START GAME</button>
                        </div>
                    </>
                )}
                {showInfo && (
                    <>
                        <div className="custom-word-overlay" onClick={() => setShowInfo(false)} />
                        <div className="info-modal">
                            <h3>How to Play WordSweeper</h3>
                            <div className="info-content">
                                <p>WordSweeper is a word-based version of Minesweeper where:</p>
                                <ul>
                                    <li>The target word represents mines you need to avoid</li>
                                    <li>Numbers are replaced with related words</li>
                                    <li>Words closer to the target word are more dangerous</li>
                                    <li>Left click to reveal cells</li>
                                    <li>Right click or use Flag Mode to mark potential mines</li>
                                    <li>Clear all safe cells to win!</li>
                                </ul>
                                <p>Word Colors:</p>
                                <ul>
                                    <li><span className="blue-text">Blue</span>: Distantly related words</li>
                                    <li><span className="orange-text">Orange</span>: Moderately related words</li>
                                    <li><span className="red-text">Red</span>: Closely related words</li>
                                </ul>
                            </div>
                            <button onClick={() => setShowInfo(false)}>Got it!</button>
                        </div>
                    </>
                )}
                <div className="board">
                    {board.map((row, i) => (
                        <div key={i} className="row">
                            {row.map((cell, j) => (
                                <div
                                    key={`${i}-${j}`}
                                    className={`cell ${cell.isRevealed ? 'revealed' : ''} ${
                                        cell.isFlagged ? 'flagged' : ''
                                    } ${gameOver && cell.isMine ? 'mine' : ''} ${
                                        cell.word ? `level-${cell.neighborMines}` : ''
                                    }`}
                                    onClick={(e) => handleCellClick(i, j, e)}
                                    onContextMenu={(e) => handleCellClick(i, j, e)}
                                >
                                    {cell.isRevealed && !cell.isMine && cell.word}
                                    {cell.isFlagged && '🚩'}
                                    {cell.isRevealed && cell.isMine && cell.word}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                {(gameOver || win) && (
                    <div className="game-over">
                        <h2>{win ? 'You Win!' : 'Game Over!'}</h2>
                        <div className="game-over-buttons">
                            <button onClick={() => startNewGame()}>Play Again</button>
                            {win && <button onClick={handleShare} className="share-button">Share 🔗</button>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Minesweeper;