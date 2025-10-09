import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Flag, Bomb, Trophy } from 'lucide-react';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

interface MinesweeperProps {
  onComplete: (score: number, errors: number) => void;
  timeRemaining: number;
  isTrialMode?: boolean;
}

export const Minesweeper: React.FC<MinesweeperProps> = ({ onComplete, timeRemaining, isTrialMode = false }) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [level, setLevel] = useState(1);
  const [errors, setErrors] = useState(0);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [gridSize, setGridSize] = useState(8);
  const [mineCount, setMineCount] = useState(10);

  const initializeGrid = useCallback((size: number, mines: number) => {
    const newGrid: Cell[][] = Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

    // Place mines randomly
    let placedMines = 0;
    while (placedMines < mines) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        placedMines++;
      }
    }

    // Calculate neighbor mines
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!newGrid[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr;
              const newCol = col + dc;
              if (
                newRow >= 0 && newRow < size &&
                newCol >= 0 && newCol < size &&
                newGrid[newRow][newCol].isMine
              ) {
                count++;
              }
            }
          }
          newGrid[row][col].neighborMines = count;
        }
      }
    }

    return newGrid;
  }, []);

  useEffect(() => {
    setGrid(initializeGrid(gridSize, mineCount));
  }, [gridSize, mineCount, initializeGrid]);

  useEffect(() => {
    if (timeRemaining === 0 && !isTrialMode) {
      onComplete(puzzlesCompleted, errors);
    }
  }, [timeRemaining, puzzlesCompleted, errors, onComplete, isTrialMode]);

  const revealCell = (row: number, col: number) => {
    if (gameOver || won || grid[row][col].isRevealed || grid[row][col].isFlagged) return;

    const newGrid = [...grid.map(r => [...r])];
    
    if (newGrid[row][col].isMine) {
      newGrid[row][col].isRevealed = true;
      setGrid(newGrid);
      setGameOver(true);
      setErrors(prev => prev + 1);
      
      // Auto-restart after brief delay
      setTimeout(() => {
        setGameOver(false);
        setGrid(initializeGrid(gridSize, mineCount));
      }, 1000);
      return;
    }

    // Flood fill for empty cells
    const reveal = (r: number, c: number) => {
      if (
        r < 0 || r >= gridSize ||
        c < 0 || c >= gridSize ||
        newGrid[r][c].isRevealed ||
        newGrid[r][c].isFlagged ||
        newGrid[r][c].isMine
      ) return;

      newGrid[r][c].isRevealed = true;

      if (newGrid[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc);
          }
        }
      }
    };

    reveal(row, col);
    setGrid(newGrid);

    // Check win condition
    const allSafeCellsRevealed = newGrid.every((row) =>
      row.every((cell) => cell.isMine || cell.isRevealed)
    );

    if (allSafeCellsRevealed) {
      setWon(true);
      setPuzzlesCompleted(prev => prev + 1);
      
      // Move to next level
      setTimeout(() => {
        setWon(false);
        const newLevel = level + 1;
        setLevel(newLevel);
        
        // Increase difficulty
        if (newLevel % 3 === 0 && gridSize < 12) {
          setGridSize(prev => prev + 1);
          setMineCount(prev => prev + 3);
        } else {
          setMineCount(prev => prev + 2);
        }
      }, 1500);
    }
  };

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver || won || grid[row][col].isRevealed) return;

    const newGrid = [...grid.map(r => [...r])];
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged;
    setGrid(newGrid);
  };

  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) {
      return cell.isFlagged ? 'bg-yellow-400' : 'bg-gray-300 hover:bg-gray-400';
    }
    if (cell.isMine) return 'bg-red-500';
    if (cell.neighborMines === 0) return 'bg-gray-100';
    return 'bg-white';
  };

  const getCellText = (cell: Cell) => {
    if (!cell.isRevealed) {
      return cell.isFlagged ? <Flag className="w-4 h-4" /> : '';
    }
    if (cell.isMine) return <Bomb className="w-4 h-4 text-white" />;
    if (cell.neighborMines === 0) return '';
    return cell.neighborMines;
  };

  const getNumberColor = (num: number) => {
    const colors = ['', 'text-blue-600', 'text-green-600', 'text-red-600', 'text-purple-600', 'text-orange-600', 'text-pink-600', 'text-gray-600', 'text-black'];
    return colors[num] || 'text-black';
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-lg font-semibold">
          <Trophy className="inline w-5 h-5 mr-2 text-yellow-500" />
          Level: {level}
        </div>
        <div className="text-lg font-semibold">
          Puzzles Completed: {puzzlesCompleted}
        </div>
        <div className="text-lg font-semibold text-red-600">
          Errors: {errors}
        </div>
      </div>

      {won && (
        <div className="text-2xl font-bold text-green-600 animate-pulse">
          Level Complete! 🎉
        </div>
      )}

      {gameOver && (
        <div className="text-2xl font-bold text-red-600 animate-pulse">
          Mine Hit! Restarting...
        </div>
      )}

      <div 
        className="inline-grid gap-1 p-4 bg-gray-200 rounded-lg"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`w-8 h-8 flex items-center justify-center text-sm font-bold border border-gray-400 rounded transition-all ${getCellColor(cell)}`}
              onClick={() => revealCell(rowIndex, colIndex)}
              onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
              disabled={gameOver || won}
            >
              <span className={getNumberColor(cell.neighborMines)}>
                {getCellText(cell)}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="text-sm text-gray-600 text-center max-w-md">
        <p><strong>How to play:</strong> Left-click to reveal cells. Right-click to flag mines.</p>
        <p>Clear all safe cells without hitting mines to complete each level!</p>
      </div>
    </div>
  );
};
