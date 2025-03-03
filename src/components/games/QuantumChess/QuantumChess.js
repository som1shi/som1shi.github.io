import React, { useState, useEffect } from 'react';
import './QuantumChess.css';

const QuantumChess = () => {
    function createInitialBoard() {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        
        const primaryTypes = ['rook', 'knight', 'bishop', 'king', 'queen', 'bishop', 'knight', 'rook'];
        
        const secondaryPool = [
            'rook', 'rook',
            'knight', 'knight',
            'bishop', 'bishop',
            'queen',
            'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'
        ];
        
        for (let i = secondaryPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [secondaryPool[i], secondaryPool[j]] = [secondaryPool[j], secondaryPool[i]];
        }
        
        for (let i = 0; i < 8; i++) {
            board[7][i] = {
                currentType: primaryTypes[i] === 'king' ? 'king' : null,
                type1: primaryTypes[i],
                type2: primaryTypes[i] === 'king' ? 'king' : secondaryPool.pop(),
                color: 'white',
                isChosen: primaryTypes[i] === 'king'
            };
            board[6][i] = {
                currentType: null,
                type1: 'pawn',
                type2: secondaryPool.pop(),
                color: 'white',
                isChosen: false
            };

            board[0][i] = {
                currentType: primaryTypes[i] === 'king' ? 'king' : null,
                type1: primaryTypes[i],
                type2: primaryTypes[i] === 'king' ? 'king' : secondaryPool.pop(),
                color: 'black',
                isChosen: primaryTypes[i] === 'king'
            };
            board[1][i] = {
                currentType: null,
                type1: 'pawn',
                type2: secondaryPool.pop(),
                color: 'black',
                isChosen: false
            };
        }
        
        return board;
    }

    const [board, setBoard] = useState(createInitialBoard());
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState('white');
    const [gameOver, setGameOver] = useState(false);
    const [possibleMoves, setPossibleMoves] = useState([]);
    const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
    const [showRules, setShowRules] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const state = params.get('state');
        
        if (state) {
            try {
                const { board: savedBoard, currentPlayer: savedPlayer, capturedPieces: savedCaptured } = JSON.parse(decodeURIComponent(state));
                
                const loadedBoard = savedBoard.map(row =>
                    row.map(piece => {
                        if (!piece) return null;
                        return {
                            ...piece,
                            currentType: piece.type === '?' ? null : piece.type
                        };
                    })
                );
                
                setBoard(loadedBoard);
                setCurrentPlayer(savedPlayer);
                setCapturedPieces(savedCaptured);
            } catch (e) {
                console.error('Failed to load shared position:', e);
            }
        }
    }, []);

    function initializeBoard() {
        const newBoard = createInitialBoard();
        setBoard(newBoard);
        setCapturedPieces({ white: [], black: [] });
        return newBoard;
    }

    const handlePieceClick = (row, col) => {
        const piece = board[row][col];
        
        if (selectedPiece) {
            if (possibleMoves.some(move => move.row === row && move.col === col)) {
                movePiece(selectedPiece, row, col);
                return;
            }
            if (piece && piece.color === currentPlayer) {
                setSelectedPiece(null);
                setPossibleMoves([]);
                if (!piece.isChosen && piece.currentType !== 'king') {
                    const newBoard = [...board];
                    const newType = Math.random() < 0.5 ? piece.type1 : piece.type2;
                    
                    newBoard[row][col] = {
                        ...piece,
                        currentType: newType,
                        isChosen: true
                    };
                    setBoard(newBoard);
                    
                    const moves = calculatePossibleMoves(row, col, newBoard[row][col]);
                    if (moves.length > 0) {
                        setSelectedPiece({ row, col, piece: newBoard[row][col] });
                        setPossibleMoves(moves);
                    }
                } else {
                    const moves = calculatePossibleMoves(row, col, piece);
                    if (moves.length > 0) {
                        setSelectedPiece({ row, col, piece });
                        setPossibleMoves(moves);
                    }
                }
                return;
            }
            setSelectedPiece(null);
            setPossibleMoves([]);
            return;
        }

        if (piece && piece.color === currentPlayer) {
            if (!piece.isChosen && piece.currentType !== 'king') {
                const newBoard = [...board];
                const newType = Math.random() < 0.5 ? piece.type1 : piece.type2;
                
                newBoard[row][col] = {
                    ...piece,
                    currentType: newType,
                    isChosen: true
                };
                setBoard(newBoard);
                
                const moves = calculatePossibleMoves(row, col, newBoard[row][col]);
                if (moves.length > 0) {
                    setSelectedPiece({ row, col, piece: newBoard[row][col] });
                    setPossibleMoves(moves);
                }
            } else {
                const moves = calculatePossibleMoves(row, col, piece);
                if (moves.length > 0) {
                    setSelectedPiece({ row, col, piece });
                    setPossibleMoves(moves);
                }
            }
        }
    };

    const movePiece = (selected, newRow, newCol) => {
        const newBoard = [...board];
        const targetPiece = board[newRow][newCol];
        const isBlackSquare = (newRow + newCol) % 2 !== 0;
        
        if (targetPiece) {
            const newCaptured = {...capturedPieces};
            if (!targetPiece.isChosen) {
                targetPiece.currentType = Math.random() < 0.5 ? targetPiece.type1 : targetPiece.type2;
                targetPiece.isChosen = true;
            }
            newCaptured[selected.piece.color].push(targetPiece);
            setCapturedPieces(newCaptured);
            
            if (targetPiece.currentType === 'king') {
                setGameOver(true);
                alert(`${selected.piece.color.toUpperCase()} wins!`);
            }
        }

        if (selected.piece.currentType === 'pawn' && (newRow === 0 || newRow === 7)) {
            selected.piece.currentType = 'queen';
            selected.piece.isChosen = true;
        }

        if (isBlackSquare && selected.piece.currentType !== 'king') {
            selected.piece.isChosen = false;
            selected.piece.currentType = null;
        }

        newBoard[newRow][newCol] = selected.piece;
        newBoard[selected.row][selected.col] = null;
        
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        setSelectedPiece(null);
        setPossibleMoves([]);
    };

    const observePiece = (row, col) => {
        return;
    };

    const calculatePossibleMoves = (row, col, piece) => {
        const moves = [];
        
        if (piece.isChosen) {
            switch(piece.currentType) {
                case 'pawn':
                    const direction = piece.color === 'white' ? -1 : 1;
                    if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
                        moves.push({ row: row + direction, col });
                        if ((piece.color === 'white' && row === 6) || (piece.color === 'black' && row === 1)) {
                            if (!board[row + direction * 2][col]) {
                                moves.push({ row: row + direction * 2, col });
                            }
                        }
                    }
                    [-1, 1].forEach(offset => {
                        const newRow = row + direction;
                        const newCol = col + offset;
                        if (isValidPosition(newRow, newCol) && 
                            board[newRow][newCol] && 
                            board[newRow][newCol].color !== piece.color) {
                            moves.push({ 
                                row: newRow, 
                                col: newCol,
                                isCapture: true 
                            });
                        }
                    });
                    break;

                case 'knight':
                    const knightMoves = [
                        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                        [1, -2], [1, 2], [2, -1], [2, 1]
                    ];
                    knightMoves.forEach(([dr, dc]) => {
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (isValidPosition(newRow, newCol) && 
                            (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color)) {
                            moves.push({ row: newRow, col: newCol });
                        }
                    });
                    break;

                case 'bishop':
                    for (let direction of [[1,1], [1,-1], [-1,1], [-1,-1]]) {
                        let [dr, dc] = direction;
                        let newRow = row + dr;
                        let newCol = col + dc;
                        while (isValidPosition(newRow, newCol)) {
                            if (board[newRow][newCol]) {
                                if (board[newRow][newCol].color !== piece.color) {
                                    moves.push({ row: newRow, col: newCol });
                                }
                                break;
                            }
                            moves.push({ row: newRow, col: newCol });
                            newRow += dr;
                            newCol += dc;
                        }
                    }
                    break;

                case 'rook':
                    for (let direction of [[0,1], [0,-1], [1,0], [-1,0]]) {
                        let [dr, dc] = direction;
                        let newRow = row + dr;
                        let newCol = col + dc;
                        while (isValidPosition(newRow, newCol)) {
                            if (board[newRow][newCol]) {
                                if (board[newRow][newCol].color !== piece.color) {
                                    moves.push({ row: newRow, col: newCol });
                                }
                                break;
                            }
                            moves.push({ row: newRow, col: newCol });
                            newRow += dr;
                            newCol += dc;
                        }
                    }
                    break;

                case 'queen':
                    for (let direction of [[0,1], [0,-1], [1,0], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]]) {
                        let [dr, dc] = direction;
                        let newRow = row + dr;
                        let newCol = col + dc;
                        while (isValidPosition(newRow, newCol)) {
                            if (board[newRow][newCol]) {
                                if (board[newRow][newCol].color !== piece.color) {
                                    moves.push({ row: newRow, col: newCol });
                                }
                                break;
                            }
                            moves.push({ row: newRow, col: newCol });
                            newRow += dr;
                            newCol += dc;
                        }
                    }
                    break;

                case 'king':
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const newRow = row + dr;
                            const newCol = col + dc;
                            if (isValidPosition(newRow, newCol) && 
                                (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color)) {
                                moves.push({ row: newRow, col: newCol });
                            }
                        }
                    }
                    break;
            }
        } else {
            const moveCounts = countMovePatterns(board, piece.color);
            
            if (moveCounts.knight < 2) {
                const knightMoves = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
                knightMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (isValidPosition(newRow, newCol) && 
                        (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                });
            }

            if (moveCounts.diagonal < 3) {
                for (let direction of [[1,1], [1,-1], [-1,1], [-1,-1]]) {
                    let [dr, dc] = direction;
                    let newRow = row + dr;
                    let newCol = col + dc;
                    while (isValidPosition(newRow, newCol)) {
                        if (board[newRow][newCol]) {
                            if (board[newRow][newCol].color !== piece.color) {
                                moves.push({ row: newRow, col: newCol });
                            }
                            break;
                        }
                        moves.push({ row: newRow, col: newCol });
                        newRow += dr;
                        newCol += dc;
                    }
                }
            }

            if (moveCounts.straight < 3) {
                for (let direction of [[0,1], [0,-1], [1,0], [-1,0]]) {
                    let [dr, dc] = direction;
                    let newRow = row + dr;
                    let newCol = col + dc;
                    while (isValidPosition(newRow, newCol)) {
                        if (board[newRow][newCol]) {
                            if (board[newRow][newCol].color !== piece.color) {
                                moves.push({ row: newRow, col: newCol });
                            }
                            break;
                        }
                        moves.push({ row: newRow, col: newCol });
                        newRow += dr;
                        newCol += dc;
                    }
                }
            }
        }
        
        return moves;
    };

    const isValidPosition = (row, col) => {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    };

    const getMoveType = (fromRow, fromCol, toRow, toCol) => {
        const dx = Math.abs(toRow - fromRow);
        const dy = Math.abs(toCol - fromCol);
        
        if (dx === 2 && dy === 1 || dx === 1 && dy === 2) return 'knight';
        if (dx === dy) return 'diagonal';
        if (dx === 0 || dy === 0) return 'straight';
        return null;
    };

    const isLegalMove = (piece, fromRow, fromCol, toRow, toCol, board) => {
        if (piece.isChosen) {
            return isValidMoveForType(piece.currentType, fromRow, fromCol, toRow, toCol, board);
        }

        const moveType = getMoveType(fromRow, fromCol, toRow, toCol);
        if (!moveType) return false;

        const moveCounts = countMovePatterns(board, piece.color);
        
        switch(moveType) {
            case 'knight':
                return moveCounts.knight < 2;
            case 'diagonal':
                return moveCounts.diagonal < 3;
            case 'straight':
                return moveCounts.straight < 3;
            default:
                return false;
        }
    };

    const updatePieceType = (piece, moveType) => {
        piece.moveHistory.push(moveType);
        
        if (piece.isChosen) return;

        if (piece.moveHistory.includes('diagonal') && piece.moveHistory.includes('straight')) {
            piece.isChosen = true;
            piece.currentType = 'queen';
        } else if (piece.moveHistory.length >= 2) {
            if (piece.moveHistory.every(m => m === 'knight')) {
                piece.isChosen = true;
                piece.currentType = 'knight';
            } else if (piece.moveHistory.every(m => m === 'diagonal')) {
                piece.isChosen = true;
                piece.currentType = 'bishop';
            } else if (piece.moveHistory.every(m => m === 'straight')) {
                piece.isChosen = true;
                piece.currentType = 'rook';
            }
        }
    };

    const isValidMoveForType = (type, fromRow, fromCol, toRow, toCol, board) => {
        const dx = Math.abs(toRow - fromRow);
        const dy = Math.abs(toCol - fromCol);
        
        if (type !== 'knight' && !isPathClear(fromRow, fromCol, toRow, toCol, board)) {
            return false;
        }

        switch(type) {
            case 'pawn':
                const direction = board[fromRow][fromCol].color === 'white' ? -1 : 1;
                if (dy === 0 && dx === 1 && direction === toRow - fromRow) {
                    return !board[toRow][toCol];
                }
                if (dy === 0 && dx === 2 && direction * 2 === toRow - fromRow &&
                    (((direction === -1) && (fromRow === 6)) || ((direction === 1) && (fromRow === 1)))) {
                    return !board[toRow][toCol] && !board[fromRow + direction][fromCol];
                }
                if (dy === 1 && dx === 1 && direction === toRow - fromRow) {
                    return board[toRow][toCol] && board[toRow][toCol].color !== board[fromRow][fromCol].color;
                }
                return false;

            case 'knight':
                return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);

            case 'bishop':
                return dx === dy;

            case 'rook':
                return dx === 0 || dy === 0;

            case 'queen':
                return dx === dy || dx === 0 || dy === 0;

            case 'king':
                return dx <= 1 && dy <= 1;

            default:
                return false;
        }
    };

    const isPathClear = (fromRow, fromCol, toRow, toCol, board) => {
        const dx = Math.sign(toRow - fromRow);
        const dy = Math.sign(toCol - fromCol);
        let x = fromRow + dx;
        let y = fromCol + dy;

        while (x !== toRow || y !== toCol) {
            if (board[x][y]) return false;
            x += dx;
            y += dy;
        }
        return true;
    };

    const countMovePatterns = (board, color) => {
        const counts = {
            knight: 0,
            diagonal: 0,
            straight: 0
        };

        board.forEach(row => {
            row.forEach(piece => {
                if (piece && piece.color === color && piece.moveHistory.length > 0) {
                    const lastMove = piece.moveHistory[piece.moveHistory.length - 1];
                    switch(lastMove) {
                        case 'knight':
                            counts.knight++;
                            break;
                        case 'diagonal':
                            counts.diagonal++;
                            break;
                        case 'straight':
                            counts.straight++;
                            break;
                        default:
                            break;
                    }
                }
            });
        });

        return counts;
    };

    const RulesModal = () => {
        if (!showRules) return null;
        
        return (
            <div className="rules-modal">
                <div className="rules-content">
                    <h2>Quantum Chess Rules</h2>
                    <div className="rules-text">
                        <h3>Pieces</h3>
                        <p>• Each piece (except the king) exists in a quantum superposition of two piece types</p>
                        <p>• The king is always in classical state and its position is always known</p>
                        <p>• When a quantum piece is touched, it collapses to one of its two possible states</p>
                        
                        <h3>Board</h3>
                        <p>• Pieces on white squares remain in their classical (known) state</p>
                        <p>• Pieces on black squares return to quantum (unknown) state</p>
                        
                        <h3>Movement</h3>
                        <p>• Once a piece is touched, it must be moved if possible</p>
                        <p>• If a quantum piece collapses to a state with no legal moves, the turn ends</p>
                        <p>• No castling or en passant captures</p>
                        <p>• Kings can move into or remain in check</p>
                        
                        <h3>Winning</h3>
                        <p>• Capture the opponent's king to win</p>
                        <p>• Draw if only kings remain or after 100 moves without captures/pawn moves</p>
                        
                        <div className="rules-footer">
                            <small>
                                Rules based on <a href="https://research.cs.queensu.ca/Parallel/QuantumChess/QuantumChess.html" target="_blank" rel="noopener noreferrer">
                                    Queen's University Quantum Chess Research
                                </a>
                            </small>
                        </div>
                    </div>
                    <button onClick={() => setShowRules(false)}>Close</button>
                </div>
            </div>
        );
    };

    const sharePosition = () => {
        const boardState = board.map(row => 
            row.map(piece => {
                if (!piece) return null;
                return {
                    type: piece.currentType || '?',
                    color: piece.color,
                    isChosen: piece.isChosen,
                    type1: piece.type1,
                    type2: piece.type2
                };
            })
        );

        const shareData = {
            board: boardState,
            currentPlayer,
            capturedPieces
        };

        const shareUrl = `${window.location.origin}${window.location.pathname}?state=${encodeURIComponent(JSON.stringify(shareData))}`;

        if (navigator.share) {
            navigator.share({
                title: "Schrödinger's Chess Position",
                text: "Check out this chess game!",
                url: shareUrl
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Position URL copied to clipboard!');
            }).catch(console.error);
        }
    };

    return (
        <div className="quantum-chess">
            <div className="window-header">
                <div className="window-title">
                    <span>♟️</span>
                    <span>Schrödinger's Chess</span>
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
                    <button onClick={() => {
                        setBoard(initializeBoard());
                        setGameOver(false);
                        setCurrentPlayer('white');
                        setPossibleMoves([]);
                        setSelectedPiece(null);
                    }}>New Game</button>
                    <div className="turn-indicator">
                        {gameOver ? 'Game Over' : `${currentPlayer}'s turn`}
                    </div>
                    <button onClick={() => setShowRules(true)}>Rules</button>
                    <button onClick={sharePosition}>Share</button>
                </div>
                <div className="captured-pieces">
                    <div className="white">
                        {capturedPieces.white.map((piece, i) => (
                            <span key={i} className="captured-piece">
                                {getSymbol(piece.currentType || piece.type1, piece.color)}
                            </span>
                        ))}
                    </div>
                    <div className="black">
                        {capturedPieces.black.map((piece, i) => (
                            <span key={i} className="captured-piece">
                                {getSymbol(piece.currentType || piece.type1, piece.color)}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="board">
                    {board.map((row, i) => (
                        <div key={i} className="row">
                            {row.map((piece, j) => (
                                <div
                                    key={`${i}-${j}`}
                                    className={`cell ${
                                        selectedPiece?.row === i && selectedPiece?.col === j ? 'selected' : ''
                                    } ${(i + j) % 2 === 0 ? 'light' : 'dark'} ${
                                        possibleMoves.some(move => move.row === i && move.col === j) ? 'possible-move' : ''
                                    }`}
                                    data-capture={possibleMoves.some(move => move.row === i && move.col === j && move.isCapture)}
                                    onClick={() => handlePieceClick(i, j)}
                                    onMouseEnter={() => observePiece(i, j)}
                                >
                                    {piece && (
                                        <div className={`piece ${piece.color} ${piece.isChosen ? 'chosen' : ''}`}>
                                            {getPieceSymbol(piece)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <RulesModal />
        </div>
    );
};

function getSymbol(type, color) {
    const symbols = {
        'white': {
            'king': '♔',
            'queen': '♕',
            'rook': '♖',
            'bishop': '♗',
            'knight': '♘',
            'pawn': '♙'
        },
        'black': {
            'king': '♚',
            'queen': '♛',
            'rook': '♜',
            'bishop': '♝',
            'knight': '♞',
            'pawn': '♟'
        }
    };
    
    return symbols[color][type] || '?';
}

function getPieceSymbol(piece) {
    if (!piece.isChosen) {
        return (
            <div className="piece-info">
                <span className="current-type">?</span>
                <span className="type1">{getSymbol(piece.type1, piece.color)}</span>
                <span className="type2">{getSymbol(piece.type2, piece.color)}</span>
            </div>
        );
    }
    
    return (
        <div className="piece-info">
            <span className="current-type">
                {getSymbol(piece.currentType, piece.color)}
            </span>
            <span className="type1">{getSymbol(piece.type1, piece.color)}</span>
            <span className="type2">{getSymbol(piece.type2, piece.color)}</span>
        </div>
    );
}

export default QuantumChess; 