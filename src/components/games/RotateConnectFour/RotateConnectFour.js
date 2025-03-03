import React, { useState, useEffect, useRef } from 'react';
import './RotateConnectFour.css';

const ROWS = 7;
const COLS = 7;

const RotateConnectFour = () => {
    const [board, setBoard] = useState(createEmptyBoard());
    const [currentPlayer, setCurrentPlayer] = useState('red');
    const [gameOver, setGameOver] = useState(false);
    const [diceRoll, setDiceRoll] = useState(null);
    const [canRotate, setCanRotate] = useState(false);
    const [winner, setWinner] = useState(null);
    const [isRotating, setIsRotating] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const diceFaceRef = useRef(null);
    const [isDiceRolling, setIsDiceRolling] = useState(false);

    function createEmptyBoard() {
        return Array(ROWS).fill().map(() => Array(COLS).fill(null));
    }

    const dropPiece = (col) => {
        if (gameOver || diceRoll !== null || isRotating || isDiceRolling) return;
        
        const newBoard = [...board.map(row => [...row])];
        
        for (let row = ROWS - 1; row >= 0; row--) {
            if (!newBoard[row][col]) {
                newBoard[row][col] = currentPlayer;
                
                if (checkWin(row, col, newBoard, currentPlayer)) {
                    setBoard(newBoard);
                    setGameOver(true);
                    setWinner(currentPlayer);
                    return;
                }
                
                setBoard(newBoard);
                
                setTimeout(() => {
                    rollDice();
                }, 200);
                return;
            }
        }
    };

    const rollDice = () => {
        setIsDiceRolling(true);
        
        if (diceFaceRef.current) {
            diceFaceRef.current.classList.add('rolling');
        }
        
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            setDiceRoll(roll);
            
            if (diceFaceRef.current) {
                diceFaceRef.current.classList.remove('rolling');
                diceFaceRef.current.className = `dice-face face-${roll}`;
            }
            
            if (roll === 6) {
                setCanRotate(true);
                setIsDiceRolling(false);
            } else {
                setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
                setTimeout(() => {
                    setDiceRoll(null);
                    setIsDiceRolling(false);
                }, 1500);
            }
        }, 800);
    };

    const rotateBoard = (direction) => {
        if (!canRotate || isRotating) return;
        
        setIsRotating(true);
        
        const newBoard = createEmptyBoard();
        
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                if (direction === 'left') {
                    newBoard[COLS - 1 - j][i] = board[i][j];
                } else {
                    newBoard[j][ROWS - 1 - i] = board[i][j];
                }
            }
        }
        
        const finalBoard = applyGravity(newBoard);
        
        const boardElement = document.querySelector('.board');
        if (boardElement) {
            boardElement.classList.add(direction === 'left' ? 'rotating-left' : 'rotating-right');
            
            setTimeout(() => {
                setBoard(finalBoard);
                setDiceRoll(null);
                setCanRotate(false);
                setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
                boardElement.classList.remove('rotating-left', 'rotating-right');
                setIsRotating(false);
            }, 550);
        } else {
            setBoard(finalBoard);
            setDiceRoll(null);
            setCanRotate(false);
            setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
            setIsRotating(false);
        }
    };

    const applyGravity = (inputBoard) => {
        const newBoard = createEmptyBoard();
        
        for (let col = 0; col < COLS; col++) {
            let bottomRow = ROWS - 1;
            for (let row = ROWS - 1; row >= 0; row--) {
                if (inputBoard[row][col]) {
                    newBoard[bottomRow][col] = inputBoard[row][col];
                    bottomRow--;
                }
            }
        }
        
        return newBoard;
    };

    const checkWin = (row, col, board, player) => {
        for (let c = 0; c <= COLS - 4; c++) {
            if (col >= c && col < c + 4) {
                if (board[row][c] === player && 
                    board[row][c + 1] === player && 
                    board[row][c + 2] === player && 
                    board[row][c + 3] === player) {
                    return true;
                }
            }
        }

        for (let r = 0; r <= ROWS - 4; r++) {
            if (row >= r && row < r + 4) {
                if (board[r][col] === player && 
                    board[r + 1][col] === player && 
                    board[r + 2][col] === player && 
                    board[r + 3][col] === player) {
                    return true;
                }
            }
        }


        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (row >= r && row < r + 4 && col >= c && col < c + 4) {
                    if (board[r][c] === player && 
                        board[r + 1][c + 1] === player && 
                        board[r + 2][c + 2] === player && 
                        board[r + 3][c + 3] === player) {
                        return true;
                    }
                }
            }
        }

        for (let r = 3; r < ROWS; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (row <= r && row > r - 4 && col >= c && col < c + 4) {
                    if (board[r][c] === player && 
                        board[r - 1][c + 1] === player && 
                        board[r - 2][c + 2] === player && 
                        board[r - 3][c + 3] === player) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    const shareGame = () => {
        const shareText = `I just won a game of Rotate Connect Four as ${winner.toUpperCase()}! Can you beat my strategy? Play now!`;

        if (navigator.share) {
            copyToClipboard(shareText + ' ' + window.location.href);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert('Game result copied to clipboard! Share it with your friends.');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                alert('Could not share game automatically. Please copy this link manually!');
            });
    };

    return (
        <div className="rotate-connect-four">
            <div className="window-header">
                <div className="window-title">
                    <span>🎲</span>
                    <span>Rotate Connect Four</span>
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
                    <div className="controls-row controls-top">
                        <button onClick={() => {
                            setBoard(createEmptyBoard());
                            setCurrentPlayer('red');
                            setGameOver(false);
                            setDiceRoll(null);
                            setCanRotate(false);
                            setWinner(null);
                            setIsRotating(false);
                        }}>New Game</button>
                        
                        <button onClick={() => setShowRules(!showRules)}>
                            {showRules ? 'Hide Rules' : 'How to Play'}
                        </button>
                    </div>
                    
                    {showRules && (
                        <div className="rules-panel">
                            <h3>How to Play Rotate Connect Four</h3>
                            <ol>
                                <li>Players take turns dropping their pieces into the board.</li>
                                <li>After each move, roll the dice.</li>
                                <li>If you roll a 6, you can rotate the board left or right before your turn ends.</li>
                                <li>Connect four of your pieces in a row (horizontally, vertically, or diagonally) to win!</li>
                                <li>When the board rotates, pieces will fall due to gravity.</li>
                            </ol>
                        </div>
                    )}
                    
                    <div className="controls-row">
                        <div className="turn-indicator">
                            {gameOver ? 
                                (winner ? `${winner.toUpperCase()} Wins!` : 'Game Over!') 
                                : `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`}
                        </div>
                    </div>
                    
                    {diceRoll !== null && (
                        <div className="controls-row dice-container">
                            <div className="dice">
                                <div ref={diceFaceRef} className={`dice-face face-${diceRoll || 1}`}>
                                    <div className="dot dot-1"></div>
                                    <div className="dot dot-2"></div>
                                    <div className="dot dot-3"></div>
                                    <div className="dot dot-4"></div>
                                    <div className="dot dot-5"></div>
                                    <div className="dot dot-6"></div>
                                </div>
                            </div>
                            <div className="dice-message">
                                {canRotate ? "You rolled 6 - You can rotate!" : `Rolled: ${diceRoll}`}
                            </div>
                        </div>
                    )}
                    
                    {canRotate && (
                        <div className="controls-row">
                            <div className="rotation-controls">
                                <button onClick={() => rotateBoard('left')} disabled={isRotating}>Rotate Left</button>
                                <button onClick={() => rotateBoard('right')} disabled={isRotating}>Rotate Right</button>
                            </div>
                        </div>
                    )}

                    {gameOver && winner && (
                        <div className="controls-row winner-controls">
                            <div className="winner-message">
                                {`${winner.toUpperCase()} Wins!`}
                            </div>
                            <button className="share-button" onClick={shareGame}>
                                Share Victory
                            </button>
                        </div>
                    )}
                </div>
                <div className="board">
                    {board.map((row, rowIndex) => (
                        <div key={rowIndex} className="row">
                            {row.map((cell, colIndex) => (
                                <div
                                    key={colIndex}
                                    className={`cell ${cell || ''}`}
                                    onClick={() => dropPiece(colIndex)}
                                >
                                    {cell && <div className={`piece ${cell}`}></div>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RotateConnectFour; 