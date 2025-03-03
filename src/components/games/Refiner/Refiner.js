import React, { useState, useEffect, useRef } from 'react';
import './Refiner.css';

const Refiner = () => {
    const [numbers, setNumbers] = useState([]);
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [targetSum, setTargetSum] = useState(0);
    const [successfulSelections, setSuccessfulSelections] = useState([]);
    const [score, setScore] = useState(0);
    const [targetsHit, setTargetsHit] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [gameActive, setGameActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [animatingToTarget, setAnimatingToTarget] = useState(false);
    const [scaryCells, setScaryCells] = useState([]);
    const [lastTargetTime, setLastTargetTime] = useState(0);
    const [hintShown, setHintShown] = useState(false);
    
    const [selectionBox, setSelectionBox] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    
    const timerRef = useRef(null);
    const hintTimerRef = useRef(null);
    const gridRef = useRef(null);
    const targetBoxRef = useRef(null);
    
    const [gameDuration, setGameDuration] = useState(60);
    
    const [shareFeedback, setShareFeedback] = useState(false);
    
    const generateRandomNumber = (row, col) => {
        return {
            value: Math.floor(Math.random() * 10),
            id: `n-${Date.now()}-${Math.random()}-${row}-${col}`,
            row,
            col,
            selected: false,
            animating: false,
            scary: false
        };
    };
    
    const findSolution = (allNumbers, target) => {
        const rows = 16;
        const cols = 16;
        const grid = Array(rows).fill().map(() => Array(cols).fill(null));
        
        allNumbers.forEach(n => {
            if (n.row < rows && n.col < cols) {
                grid[n.row][n.col] = n;
            }
        });
        
        for (let height = 1; height <= 4; height++) {
            for (let width = 1; width <= 4; width++) {
                if (height * width < 2 || height * width > 9) continue;
                
                for (let startRow = 0; startRow <= rows - height; startRow++) {
                    for (let startCol = 0; startCol <= cols - width; startCol++) {
                        let sum = 0;
                        let boxNumbers = [];
                        
                        for (let r = startRow; r < startRow + height; r++) {
                            for (let c = startCol; c < startCol + width; c++) {
                                if (grid[r][c]) {
                                    sum += grid[r][c].value;
                                    boxNumbers.push(grid[r][c].id);
                                }
                            }
                        }
                        
                        if (sum === target && boxNumbers.length > 0) {
                            return boxNumbers;
                        }
                    }
                }
            }
        }
        
        for (let startRow = 0; startRow < rows; startRow++) {
            for (let startCol = 0; startCol < cols; startCol++) {
                let sum = 0;
                let lineNumbers = [];
                for (let c = startCol; c < Math.min(startCol + 4, cols); c++) {
                    if (grid[startRow][c]) {
                        sum += grid[startRow][c].value;
                        lineNumbers.push(grid[startRow][c].id);
                        if (sum === target && lineNumbers.length >= 2) {
                            return lineNumbers;
                        }
                    }
                }
                
                sum = 0;
                lineNumbers = [];
                for (let r = startRow; r < Math.min(startRow + 4, rows); r++) {
                    if (grid[r][startCol]) {
                        sum += grid[r][startCol].value;
                        lineNumbers.push(grid[r][startCol].id);
                        if (sum === target && lineNumbers.length >= 2) {
                            return lineNumbers;
                        }
                    }
                }
            }
        }
        
        return [];
    };
    
    const generateNumbers = () => {
        const newNumbers = [];
        const rows = 16;
        const cols = 16;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                newNumbers.push(generateRandomNumber(row, col));
            }
        }
        
        const boxHeight = Math.floor(Math.random() * 3) + 1;
        const boxWidth = Math.floor(Math.random() * 3) + 1;
        
        const startRow = Math.floor(Math.random() * (rows - boxHeight));
        const startCol = Math.floor(Math.random() * (cols - boxWidth));
        
        let sum = 0;
        for (let r = startRow; r < startRow + boxHeight; r++) {
            for (let c = startCol; c < startCol + boxWidth; c++) {
                const index = r * cols + c;
                if (index < newNumbers.length) {
                    sum += newNumbers[index].value;
                }
            }
        }
        
        setTargetSum(sum);
        
        setLastTargetTime(Date.now());
        setHintShown(false);
        setScaryCells([]);
        
        return newNumbers;
    };

    const replaceSelectedNumbers = () => {
        const selectedIds = new Set(selectedNumbers);
        
        const selectedCells = numbers
            .filter(n => selectedIds.has(n.id))
            .map(n => ({
                id: n.id,
                value: n.value,
                element: document.querySelector(`[data-id="${n.id}"]`),
                row: n.row,
                col: n.col
            }));
        
        setSuccessfulSelections(selectedCells.map(n => n.value));
        setAnimatingToTarget(true);
        
        const targetBox = targetBoxRef.current;
        const targetRect = targetBox.getBoundingClientRect();
        const gridRect = gridRef.current.getBoundingClientRect();
        
        selectedCells.forEach(cell => {
            if (cell.element) {
                const cellRect = cell.element.getBoundingClientRect();
                
                const flyingEl = document.createElement('div');
                flyingEl.className = 'flying-number';
                flyingEl.textContent = cell.value;
                
                flyingEl.style.position = 'fixed';
                flyingEl.style.left = `${cellRect.left}px`;
                flyingEl.style.top = `${cellRect.top}px`;
                flyingEl.style.width = `${cellRect.width}px`;
                flyingEl.style.height = `${cellRect.height}px`;
                flyingEl.style.display = 'flex';
                flyingEl.style.alignItems = 'center';
                flyingEl.style.justifyContent = 'center';
                flyingEl.style.fontSize = '16px';
                flyingEl.style.fontWeight = 'bold';
                flyingEl.style.color = '#7AF3D0';
                flyingEl.style.zIndex = '50';
                
                document.body.appendChild(flyingEl);
                
                setTimeout(() => {
                    flyingEl.style.transition = 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1.2)';
                    flyingEl.style.left = `${targetRect.left + targetRect.width/2 - cellRect.width/2}px`;
                    flyingEl.style.top = `${targetRect.top + targetRect.height/2 - cellRect.height/2}px`;
                    flyingEl.style.opacity = '0.8';
                    flyingEl.style.transform = 'scale(0.5)';
                    
                    setTimeout(() => {
                        document.body.removeChild(flyingEl);
                    }, 600);
                }, 50 + (cell.row + cell.col) * 20);
            }
        });
        
        targetBox.classList.add('receiving');
        
        setTimeout(() => {
            targetBox.classList.remove('receiving');
            
            const newNumbers = [...numbers];
            let replacements = 0;
            
            for (let i = 0; i < newNumbers.length; i++) {
                if (selectedIds.has(newNumbers[i].id)) {
                    const { row, col } = newNumbers[i];
                    newNumbers[i] = generateRandomNumber(row, col);
                    replacements++;
                }
            }
            
            setTimeout(() => {
                setNumbers(newNumbers);
                setSelectedNumbers([]);
                setAnimatingToTarget(false);
                
                const newTarget = Math.floor(Math.random() * 15) + 5;
                setTargetSum(newTarget);
                setLastTargetTime(Date.now());
                setHintShown(false);
                setScaryCells([]);
                
                console.log(`Replaced ${replacements} numbers with new ones. New target: ${newTarget}`);
            }, 300);
        }, 800);
    };

    useEffect(() => {
        if (selectedNumbers.length > 0 && !animatingToTarget) {
            const currentSum = getCurrentSum();
            
            if (currentSum === targetSum) {
                setScore(prev => prev + 1);
                setTargetsHit(prev => prev + 1);
                
                replaceSelectedNumbers();
            }
        }
    }, [selectedNumbers]);
    
    useEffect(() => {
        if (!gameActive && !gameOver) {
            setNumbers(generateNumbers());
            setScaryCells([]);
        }
    }, [gameActive, gameOver]);
    
    useEffect(() => {
        if (gameActive && numbers.length > 0 && !animatingToTarget) {
            const timeSinceLastTarget = Date.now() - lastTargetTime;
            
            if (timeSinceLastTarget > 10000 && !hintShown) {
                const solution = findSolution(numbers, targetSum);
                
                if (solution.length > 0) {
                    console.log("Activating scary numbers hint");
                    setScaryCells(solution);
                    setHintShown(true);
                }
            }
        }
        
        return () => {};
    }, [gameActive, numbers, targetSum, lastTargetTime, hintShown, timeLeft, animatingToTarget]);
    
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (hintTimerRef.current) {
                clearInterval(hintTimerRef.current);
            }
            
            setGameActive(false);
            setGameOver(false);
            
            const flyingNumbers = document.querySelectorAll('.flying-number');
            flyingNumbers.forEach(el => {
                if (document.body.contains(el)) {
                    document.body.removeChild(el);
                }
            });
        };
    }, []);
    
    const startGame = () => {
        setGameActive(true);
        setGameOver(false);
        setScore(0);
        setTargetsHit(0);
        setTimeLeft(gameDuration);
        setNumbers(generateNumbers());
        setSelectedNumbers([]);
        setSuccessfulSelections([]);
        setAnimatingToTarget(false);
        setScaryCells([]);
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    
    const handleMouseDown = (e) => {
        if (!gameActive || animatingToTarget) return;
        
        setSelectedNumbers([]);
        setNumbers(prev => prev.map(n => ({...n, selected: false})));
        
        const gridRect = gridRef.current.getBoundingClientRect();
        const startX = e.clientX - gridRect.left;
        const startY = e.clientY - gridRect.top;
        
        setSelectionStart({ x: startX, y: startY });
        setSelectionBox({
            left: startX,
            top: startY,
            width: 0,
            height: 0
        });
        setIsSelecting(true);
    };
    
    const handleMouseMove = (e) => {
        if (!isSelecting || !gameActive || animatingToTarget) return;
        
        const gridRect = gridRef.current.getBoundingClientRect();
        const currentX = e.clientX - gridRect.left;
        const currentY = e.clientY - gridRect.top;
        
        const left = Math.min(selectionStart.x, currentX);
        const top = Math.min(selectionStart.y, currentY);
        const width = Math.abs(currentX - selectionStart.x);
        const height = Math.abs(currentY - selectionStart.y);
        
        setSelectionBox({ left, top, width, height });
    };
    
    const handleMouseUp = () => {
        if (!isSelecting || !gameActive || animatingToTarget) return;
        
        setIsSelecting(false);
        
        if (!selectionBox || selectionBox.width < 5 || selectionBox.height < 5) {
            setSelectionBox(null);
            return;
        }
        
        const cellElements = gridRef.current.querySelectorAll('.grid-cell');
        const selectedIds = [];
        
        cellElements.forEach(cellElement => {
            const cellRect = cellElement.getBoundingClientRect();
            const gridRect = gridRef.current.getBoundingClientRect();
            
            const centerX = (cellRect.left + cellRect.right) / 2 - gridRect.left;
            const centerY = (cellRect.top + cellRect.bottom) / 2 - gridRect.top;
            
            if (
                centerX >= selectionBox.left && 
                centerX <= selectionBox.left + selectionBox.width &&
                centerY >= selectionBox.top && 
                centerY <= selectionBox.top + selectionBox.height
            ) {
                const id = cellElement.getAttribute('data-id');
                selectedIds.push(id);
            }
        });
        
        setSelectedNumbers(selectedIds);
        
        setNumbers(prev => prev.map(n => ({
            ...n, 
            selected: selectedIds.includes(n.id),
            animating: selectedIds.includes(n.id)
        })));
        
        setTimeout(() => {
            setSelectionBox(null);
        }, 200);
    };
    
    const getCurrentSum = () => {
        return selectedNumbers.reduce((sum, id) => {
            const number = numbers.find(n => n.id === id);
            return sum + (number ? number.value : 0);
        }, 0);
    };
    
    const endGame = () => {
        clearInterval(timerRef.current);
        setGameActive(false);
        setGameOver(true);
    };
    
    const currentSum = getCurrentSum();
    
    const shareScore = () => {
        const gameUrl = "https://som1shi.github.io/refiner";
        
        const shareText = `I refined ${score} targets in ${gameDuration} seconds playing Refiner! Can you beat my score?`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Refiner Score',
                text: shareText,
                url: gameUrl
            })
            .catch(error => {
                console.log('Error sharing:', error);
                copyToClipboard(`${shareText}\n\n${gameUrl}`);
            });
        } else {
            copyToClipboard(`${shareText}\n\n${gameUrl}`);
            
            setShareFeedback(true);
            setTimeout(() => setShareFeedback(false), 2000);
        }
    };
    
    const copyToClipboard = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        
        textarea.select();
        document.execCommand('copy');
        
        document.body.removeChild(textarea);
        
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 2000);
    };
    
    const shareButtonText = shareFeedback ? 'Copied to clipboard!' : 'Share Score';

    return (
        <div className="refiner">
            <div className="back-button" onClick={() => window.history.back()}>×</div>
            <div className="mdr-header">
                <div className="timer-container">
                    <div 
                        className="timer-progress"
                        style={{ width: `${(timeLeft / gameDuration) * 100}%` }}
                    ></div>
                    <span className="timer-text">{timeLeft}s</span>
                </div>
                <div className="score-display">
                    <span>Score: {score}</span>
                </div>
                <div className="company-logo">SOMVANSHI</div>
            </div>
            
            <div className="refiner-container">
                <div 
                    className="numbers-grid" 
                    ref={gridRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {numbers.map(number => (
                        <div
                            key={number.id}
                            data-id={number.id}
                            className={`
                                grid-cell 
                                ${number.selected ? 'selected' : ''} 
                                ${number.animating ? 'animating' : ''} 
                                ${scaryCells.includes(number.id) ? 'scary' : ''}
                            `}
                        >
                            {number.value}
                        </div>
                    ))}
                    
                    {selectionBox && (
                        <div 
                            className="selection-box"
                            style={{
                                left: `${selectionBox.left}px`,
                                top: `${selectionBox.top}px`,
                                width: `${selectionBox.width}px`,
                                height: `${selectionBox.height}px`
                            }}
                        />
                    )}
                </div>
                
                <div className="target-box-container">
                    <div className="target-box" ref={targetBoxRef}>
                        <div className="target-label">TARGET: {targetSum}</div>
                        <div className="target-sum">
                            {successfulSelections.length > 0 && animatingToTarget && (
                                <div className="number-collection">
                                    {successfulSelections.map((value, index) => (
                                        <div key={index} className="falling-number">
                                            {value}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedNumbers.length > 0 && (
                                <div className={`current-sum ${currentSum === targetSum ? 'correct' : currentSum > targetSum ? 'over' : ''}`}>
                                    {currentSum}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {!gameActive && !gameOver && (
                <div className="intro-screen">
                    <h1>Data Refinement</h1>
                    <p>Drag to select numbers that add up to the target sum.</p>
                    <p>Selected numbers will be replaced with new ones.</p>
                    <div className="duration-options">
                        <button 
                            className={`duration-button ${gameDuration === 30 ? 'selected' : ''}`} 
                            onClick={() => setGameDuration(30)}
                        >
                            30 Seconds
                        </button>
                        <button 
                            className={`duration-button ${gameDuration === 60 ? 'selected' : ''}`} 
                            onClick={() => setGameDuration(60)}
                        >
                            60 Seconds
                        </button>
                        <button 
                            className={`duration-button ${gameDuration === 180 ? 'selected' : ''}`} 
                            onClick={() => setGameDuration(180)}
                        >
                            3 Minutes
                        </button>
                        <button 
                            className={`duration-button ${gameDuration === 300 ? 'selected' : ''}`} 
                            onClick={() => setGameDuration(300)}
                        >
                            5 Minutes
                        </button>
                        <button 
                            className={`duration-button ${gameDuration === 600 ? 'selected' : ''}`} 
                            onClick={() => setGameDuration(600)}
                        >
                            10 Minutes
                        </button>
                    </div>
                    <button className="start-button" onClick={startGame}>Begin</button>
                </div>
            )}
            
            {gameOver && (
                <div className="game-over">
                    <div className="game-over-content">
                        <h2>Session Concluded</h2>
                        <p>Targets Refined: {targetsHit}</p>
                        <p>Score: {score}</p>
                        
                        <button className="share-button" onClick={shareScore}>
                            {shareButtonText}
                        </button>
                        
                        <div className="duration-options">
                            <button 
                                className={`duration-button ${gameDuration === 30 ? 'selected' : ''}`} 
                                onClick={() => setGameDuration(30)}
                            >
                                30 Seconds
                            </button>
                            <button 
                                className={`duration-button ${gameDuration === 60 ? 'selected' : ''}`} 
                                onClick={() => setGameDuration(60)}
                            >
                                60 Seconds
                            </button>
                            <button 
                                className={`duration-button ${gameDuration === 180 ? 'selected' : ''}`} 
                                onClick={() => setGameDuration(180)}
                            >
                                3 Minutes
                            </button>
                            <button 
                                className={`duration-button ${gameDuration === 300 ? 'selected' : ''}`} 
                                onClick={() => setGameDuration(300)}
                            >
                                5 Minutes
                            </button>
                            <button 
                                className={`duration-button ${gameDuration === 600 ? 'selected' : ''}`} 
                                onClick={() => setGameDuration(600)}
                            >
                                10 Minutes
                            </button>
                        </div>
                        <button className="start-button" onClick={startGame}>Restart</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Refiner; 