import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Target, Flame, Sparkles, RotateCcw, Flag, CheckCircle2, AlertCircle, MousePointer, Bomb, Zap, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTabSwitchDetection } from '@/hooks/useTabSwitchDetection';
import { useNavigate } from 'react-router-dom';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

interface MinesweeperProps {
  onComplete: (score: number, errors: number, failed?: boolean, failureReason?: string) => void;
  timeRemaining: number;
  isTrialMode?: boolean;
}

type MineMode = 'veryFew' | 'few' | 'normal' | 'many' | 'full';

const mineModeLabels: Record<MineMode, string> = {
  veryFew: 'Very Few Mines (5)',
  few: 'Few Mines (10)',
  normal: 'Normal Mines',
  many: 'Many Mines',
  full: 'Full Mines (1 Safe)',
};

export const Minesweeper: React.FC<MinesweeperProps> = ({ onComplete, timeRemaining, isTrialMode = false }) => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [level, setLevel] = useState(1);
  const [errors, setErrors] = useState(0);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [gridSize, setGridSize] = useState(8);
  const [mineCount, setMineCount] = useState(10);
  const [mineMode, setMineMode] = useState<MineMode>('normal');

  // Tab switch detection - only enabled when not in trial mode
  useTabSwitchDetection({
    maxViolations: 3,
    enabled: !isTrialMode,
    onDisqualified: () => {
      // Mark as failed and navigate to assessment page
      onComplete(puzzlesCompleted, errors, true, 'Disqualified due to tab switching violations');
      navigate('/applicant/assessment');
    },
  });

  const calculateMineCount = useCallback((mode: MineMode, size: number, currentLevel: number) => {
    const maxMines = size * size - 1;
    switch (mode) {
      case 'veryFew':
        return Math.min(5, maxMines);
      case 'few':
        return Math.min(10, maxMines);
      case 'many':
        return Math.min(Math.floor(size * size * 0.35), maxMines);
      case 'full':
        return maxMines;
      case 'normal':
      default:
        return Math.min(Math.floor(size * size * 0.15) + (currentLevel - 1) * 2, maxMines);
    }
  }, []);

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
    const totalCells = size * size;
    let safeCellIndex = -1;

    if (mineMode === 'full') {
      safeCellIndex = Math.floor(Math.random() * totalCells);
    }

    while (placedMines < mines) {
      const index = Math.floor(Math.random() * totalCells);
      if (index === safeCellIndex) continue;

      const row = Math.floor(index / size);
      const col = index % size;

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
  }, [mineMode]);

  useEffect(() => {
    const count = calculateMineCount(mineMode, gridSize, level);
    setMineCount(count);
  }, [gridSize, mineMode, level, calculateMineCount]);

  useEffect(() => {
    setGrid(initializeGrid(gridSize, mineCount));
    setGameOver(false);
    setWon(false);
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
      return cell.isFlagged 
        ? 'bg-gradient-to-br from-yellow-400 to-orange-400 border-2 border-yellow-500' 
        : 'bg-gradient-to-br from-[#8558ed]/80 to-[#b18aff]/80 hover:from-[#8558ed] hover:to-[#b18aff] border-2 border-[#8558ed]/30';
    }
    if (cell.isMine) return 'bg-gradient-to-br from-red-500 to-rose-600 border-2 border-red-600';
    if (cell.neighborMines === 0) return 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200';
    return 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300';
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
    const colors = [
      '', 
      'text-blue-600 font-extrabold', 
      'text-green-600 font-extrabold', 
      'text-red-600 font-extrabold', 
      'text-[#8558ed] font-extrabold', 
      'text-orange-600 font-extrabold', 
      'text-pink-600 font-extrabold', 
      'text-gray-700 font-extrabold', 
      'text-black font-extrabold'
    ];
    return colors[num] || 'text-black font-extrabold';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Animated Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 bg-[#8558ed]/20 rounded-full blur-3xl top-10 -left-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-80 h-80 bg-[#b18aff]/20 rounded-full blur-3xl bottom-10 -right-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute w-72 h-72 bg-[#8558ed]/15 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 pointer-events-none"
      >
        <Sparkles className="w-8 h-8 text-[#8558ed]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-32 right-16 pointer-events-none"
      >
        <Zap className="w-10 h-10 text-[#b18aff]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 15, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-24 left-20 pointer-events-none"
      >
        <Star className="w-7 h-7 text-[#8558ed]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 18, 0],
          rotate: [0, -12, 0],
        }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-32 right-24 pointer-events-none"
      >
        <Target className="w-9 h-9 text-[#b18aff]/30" />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-8"
      >
        <motion.h1
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8558ed] via-[#b18aff] to-[#8558ed] 
           animate-gradient-x drop-shadow-[0_0_25px_rgba(133,88,237,0.3)] tracking-tight mb-2 flex items-center justify-center gap-3"
        >
          <Target className="w-12 h-12 text-[#8558ed]" />
          Minesweeper Quest
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[#8558ed]/80 font-medium flex items-center justify-center gap-2"
        >
          <Flame className="w-5 h-5" />
          Clear the board without hitting mines!
        </motion.p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex items-center gap-4 mb-6 flex-wrap justify-center"
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl px-6 py-3 shadow-lg shadow-[#8558ed]/10"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-tr from-[#8558ed] to-[#b18aff] w-10 h-10 rounded-full flex items-center justify-center"
            >
              <Trophy className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-xs text-[#030303]/60 font-medium">Level</div>
              <div className="text-2xl font-bold text-[#8558ed]">{level}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl px-6 py-3 shadow-lg shadow-[#8558ed]/10"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-tr from-green-500 to-emerald-500 w-10 h-10 rounded-full flex items-center justify-center"
            >
              <Star className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-xs text-[#030303]/60 font-medium">Completed</div>
              <div className="text-2xl font-bold text-green-600">{puzzlesCompleted}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl px-6 py-3 shadow-lg shadow-[#8558ed]/10"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-tr from-red-500 to-rose-500 w-10 h-10 rounded-full flex items-center justify-center"
            >
              <Bomb className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-xs text-[#030303]/60 font-medium">Errors</div>
              <div className="text-2xl font-bold text-red-600">{errors}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Mine Mode Selection */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="mb-6 flex gap-4 justify-center flex-wrap"
      >
        {(['veryFew', 'few', 'normal', 'many', 'full'] as MineMode[]).map((mode) => (
          <Button
            key={mode}
            variant={mineMode === mode ? 'default' : 'outline'}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              mineMode === mode
                ? 'shadow-lg shadow-[#8558ed]/30 bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white'
                : 'border-[#8558ed]/40 text-[#8558ed] hover:bg-[#8558ed]/10'
            }`}
            onClick={() => setMineMode(mode)}
          >
            {mineModeLabels[mode]}
          </Button>
        ))}
      </motion.div>

      {/* Win Animation */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-4"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-green-500/30 flex items-center gap-3"
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-[#8558ed]" />
              </motion.span>
              <span className="text-2xl font-bold">Level Complete!</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Animation */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-4"
          >
            <motion.div
              animate={{ x: [-5, 5, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-red-500/30 flex items-center gap-3"
            >
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <AlertCircle className="w-8 h-8 text-red-500" />
              </motion.span>
              <span className="text-2xl font-bold">Mine Hit! Restarting...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Board and Instructions Side by Side */}
      <div className="flex items-start gap-8 justify-center">
        {/* Instructions - Left Side */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-64"
        >
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg shadow-[#8558ed]/10 sticky top-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Target className="w-5 h-5 text-[#8558ed]" />
              <h3 className="text-lg font-bold text-[#8558ed]">How to Play</h3>
            </div>
            <div className="space-y-2 text-sm text-[#030303]/70">
              <p className="flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-[#8558ed]" />
                <span><strong>Left-click</strong> to reveal cells</span>
              </p>
              <p className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-[#8558ed]" />
                <span><strong>Right-click</strong> to flag mines</span>
              </p>
              <p className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#8558ed]" />
                <span>Clear all safe cells to win!</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Game Board - Right Side */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-2xl shadow-[#8558ed]/20"
        >
          <div 
            className="inline-grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <motion.button
                  key={`${rowIndex}-${colIndex}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: (rowIndex * gridSize + colIndex) * 0.01,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  whileHover={{ scale: cell.isRevealed ? 1 : 1.1, y: cell.isRevealed ? 0 : -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg transition-all duration-200 ${getCellColor(cell)} ${
                    !cell.isRevealed ? 'shadow-md hover:shadow-lg' : ''
                  }`}
                  onClick={() => revealCell(rowIndex, colIndex)}
                  onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
                  disabled={gameOver || won}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={getNumberColor(cell.neighborMines)}
                  >
                    {getCellText(cell)}
                  </motion.span>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 5s ease infinite; }
      `}</style>
    </motion.div>
  );
};
