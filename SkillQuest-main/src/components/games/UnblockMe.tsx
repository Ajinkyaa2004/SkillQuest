import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, Zap, Star, Target, Car, MousePointer, Keyboard, RefreshCw } from 'lucide-react';
import { useTabSwitchDetection } from '@/hooks/useTabSwitchDetection';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generatePuzzleFromGemini } from '@/lib/gemini-api';

interface Block {
  id: number;
  row: number;
  col: number;
  length: number;
  orientation: 'horizontal' | 'vertical';
  isTarget: boolean;
  color: string;
}

interface UnblockMeProps {
  onComplete: (score: number, totalMoves: number, failed?: boolean, failureReason?: string) => void;
  timeRemaining: number;
  isTrialMode?: boolean;
}

const GRID_SIZE = 6;
const TARGET_ROW = 2;
const TARGET_EXIT_COL = 5;

// Pre-defined puzzles to ensure they are all solvable and properly designed
const PREDEFINED_PUZZLES: Block[][] = [
  // Level 1 - Very Easy
  [
    { id: 0, row: 2, col: 0, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 2, col: 3, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 4, col: 1, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-green-500' },
  ],
  // Level 2 - Easy
  [
    { id: 0, row: 2, col: 1, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 3, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 3, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 4, col: 4, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-yellow-500' },
  ],
  // Level 3 - Easy
  [
    { id: 0, row: 2, col: 0, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 1, col: 4, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 4, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-yellow-500' },
  ],
  // Level 4 - Easy
  [
    { id: 0, row: 2, col: 2, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 0, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 3, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 2, col: 4, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-purple-500' },
  ],
  // Level 5 - Medium
  [
    { id: 0, row: 2, col: 1, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 0, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 1, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 3, col: 3, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 1, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-purple-500' },
  ],
  // Level 6 - Medium
  [
    { id: 0, row: 2, col: 0, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 1, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 3, col: 3, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 4, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-purple-500' },
  ],
  // Level 7 - Medium
  [
    { id: 0, row: 2, col: 2, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 1, col: 5, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-purple-500' },
  ],
  // Level 8 - Challenging
  [
    { id: 0, row: 2, col: 1, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 1, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 0, length: 3, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 1, col: 3, length: 3, orientation: 'vertical', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 0, length: 3, orientation: 'horizontal', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 4, col: 4, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-pink-500' },
    { id: 6, row: 0, col: 4, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-indigo-500' },
  ],
  // Level 9 - Challenging
  [
    { id: 0, row: 2, col: 0, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 2, length: 3, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 1, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 0, col: 3, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 3, length: 3, orientation: 'horizontal', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 4, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-pink-500' },
    { id: 6, row: 3, col: 0, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-indigo-500' },
    { id: 7, row: 0, col: 5, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-orange-500' },
  ],
  // Level 10 - Challenging
  [
    { id: 0, row: 2, col: 1, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 1, col: 1, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 0, col: 2, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 1, col: 4, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 3, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-pink-500' },
    { id: 6, row: 3, col: 3, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-indigo-500' },
    { id: 7, row: 4, col: 4, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-orange-500' },
  ],
  // Level 11 - Medium
  [
    { id: 0, row: 2, col: 0, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 1, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 2, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 0, col: 3, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 3, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 5, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-pink-500' },
  ],
  // Level 12 - Medium
  [
    { id: 0, row: 2, col: 1, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 0, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 1, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 1, col: 3, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 1, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 4, col: 0, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-pink-500' },
  ],
  // Level 13 - Medium
  [
    { id: 0, row: 2, col: 2, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 1, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 2, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 1, col: 4, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 3, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-pink-500' },
  ],
  // Level 14 - Medium
  [
    { id: 0, row: 2, col: 0, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 0, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 2, col: 3, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 5, col: 4, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-pink-500' },
  ],
  // Level 15 - Medium
  [
    { id: 0, row: 2, col: 1, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 1, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 2, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 1, col: 4, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 3, col: 3, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-pink-500' },
  ],
  // Level 16 - Medium
  [
    { id: 0, row: 2, col: 0, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 1, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 2, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 2, col: 3, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 4, col: 2, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-pink-500' },
  ],
  // Level 17 - Medium
  [
    { id: 0, row: 2, col: 2, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 2, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 0, col: 3, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 4, col: 4, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-pink-500' },
  ],
  // Level 18 - Medium
  [
    { id: 0, row: 2, col: 1, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 0, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 1, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 0, col: 3, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 3, col: 1, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 4, col: 3, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-pink-500' },
  ],
  // Level 19 - Medium
  [
    { id: 0, row: 2, col: 0, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 1, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 0, col: 2, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 1, col: 4, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 2, col: 3, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 3, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-pink-500' },
  ],
  // Level 20 - Medium
  [
    { id: 0, row: 2, col: 1, length: 2, orientation: 'horizontal', isTarget: true, color: 'bg-red-500' },
    { id: 1, row: 0, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-blue-500' },
    { id: 2, row: 1, col: 1, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-green-500' },
    { id: 3, row: 0, col: 2, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-yellow-500' },
    { id: 4, row: 1, col: 4, length: 2, orientation: 'vertical', isTarget: false, color: 'bg-purple-500' },
    { id: 5, row: 3, col: 0, length: 2, orientation: 'horizontal', isTarget: false, color: 'bg-pink-500' },
  ],
];

export const UnblockMe: React.FC<UnblockMeProps> = ({ onComplete, timeRemaining, isTrialMode = false }) => {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState(1);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingPuzzle, setIsLoadingPuzzle] = useState(false);
  const [workingModel, setWorkingModel] = useState<string | null>(null);

  // Tab switch detection - only enabled when not in trial mode
  useTabSwitchDetection({
    maxViolations: 3,
    enabled: !isTrialMode,
    onDisqualified: () => {
      // Mark as failed and navigate to assessment page
      onComplete(puzzlesCompleted, totalMoves, true, 'Disqualified due to tab switching violations');
      navigate('/applicant/assessment');
    },
  });

  const generatePuzzle = useCallback(async (levelNum: number): Promise<Block[]> => {
    // Try to generate puzzle from Gemini API first
    setIsLoadingPuzzle(true);
    console.log('Generating puzzle for level:', levelNum + 1);
    
    try {
      const geminiResult = await generatePuzzleFromGemini(levelNum + 1);
      if (geminiResult) {
        console.log('Using Gemini-generated puzzle');
        setWorkingModel(geminiResult.model);
        setIsLoadingPuzzle(false);
        return geminiResult.puzzle;
      }
    } catch (error) {
      console.error('Error generating puzzle from Gemini:', error);
    }
    
    // Fallback to pre-defined puzzles if Gemini fails
    console.log('Falling back to predefined puzzle');
    setWorkingModel(null);
    setIsLoadingPuzzle(false);
    const puzzleIndex = (levelNum + refreshKey) % PREDEFINED_PUZZLES.length;
    // Deep clone the puzzle to avoid mutations
    return JSON.parse(JSON.stringify(PREDEFINED_PUZZLES[puzzleIndex]));
  }, [refreshKey]);

  useEffect(() => {
    const loadPuzzle = async () => {
      const puzzle = await generatePuzzle(level - 1);
      setBlocks(puzzle);
      setMoves(0);
      setSelectedBlock(null);
    };
    loadPuzzle();
  }, [level, generatePuzzle, refreshKey]);

  useEffect(() => {
    if (timeRemaining === 0 && !isTrialMode) {
      onComplete(puzzlesCompleted, totalMoves);
    }
  }, [timeRemaining, puzzlesCompleted, totalMoves, onComplete, isTrialMode]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setMoves(0);
    setSelectedBlock(null);
  };

  const canMoveBlock = (block: Block, newRow: number, newCol: number): boolean => {
    const grid: boolean[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    
    // Fill grid with all blocks except the one being moved
    blocks.forEach(b => {
      if (b.id !== block.id) {
        if (b.orientation === 'horizontal') {
          for (let i = 0; i < b.length; i++) {
            if (b.row >= 0 && b.row < GRID_SIZE && b.col + i >= 0 && b.col + i < GRID_SIZE) {
              grid[b.row][b.col + i] = true;
            }
          }
        } else {
          for (let i = 0; i < b.length; i++) {
            if (b.row + i >= 0 && b.row + i < GRID_SIZE && b.col >= 0 && b.col < GRID_SIZE) {
              grid[b.row + i][b.col] = true;
            }
          }
        }
      }
    });

    // Check if new position is valid
    if (block.orientation === 'horizontal') {
      if (newCol < 0 || newCol + block.length > GRID_SIZE) return false;
      for (let i = 0; i < block.length; i++) {
        if (grid[newRow][newCol + i]) return false;
      }
    } else {
      if (newRow < 0 || newRow + block.length > GRID_SIZE) return false;
      for (let i = 0; i < block.length; i++) {
        if (grid[newRow + i][newCol]) return false;
      }
    }

    return true;
  };

  const moveBlock = (blockId: number, direction: 'up' | 'down' | 'left' | 'right') => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    let newRow = block.row;
    let newCol = block.col;

    if (direction === 'up' && block.orientation === 'vertical') newRow--;
    else if (direction === 'down' && block.orientation === 'vertical') newRow++;
    else if (direction === 'left' && block.orientation === 'horizontal') newCol--;
    else if (direction === 'right' && block.orientation === 'horizontal') newCol++;
    else return;

    if (canMoveBlock(block, newRow, newCol)) {
      const newBlocks = blocks.map(b =>
        b.id === blockId ? { ...b, row: newRow, col: newCol } : b
      );
      setBlocks(newBlocks);
      setMoves(prev => prev + 1);
      setTotalMoves(prev => prev + 1);

      // Check win condition
      const targetBlock = newBlocks.find(b => b.isTarget);
      if (targetBlock && targetBlock.col + targetBlock.length === TARGET_EXIT_COL + 1) {
        setTimeout(() => {
          setPuzzlesCompleted(prev => prev + 1);
          setLevel(prev => prev + 1);
        }, 500);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedBlock === null) return;
    
    e.preventDefault();
    if (e.key === 'ArrowUp') moveBlock(selectedBlock, 'up');
    else if (e.key === 'ArrowDown') moveBlock(selectedBlock, 'down');
    else if (e.key === 'ArrowLeft') moveBlock(selectedBlock, 'left');
    else if (e.key === 'ArrowRight') moveBlock(selectedBlock, 'right');
  };

  const renderGrid = () => {
    const grid: React.ReactNode[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

    // Mark exit
    grid[TARGET_ROW][TARGET_EXIT_COL] = (
      <div className="w-full h-full bg-green-200 border-2 border-green-500 flex items-center justify-center text-xs font-bold">
        EXIT
      </div>
    );

    blocks.forEach(block => {
      if (block.orientation === 'horizontal') {
        for (let i = 0; i < block.length; i++) {
          grid[block.row][block.col + i] = (
            <div
              className={`w-full h-full ${block.color} ${selectedBlock === block.id ? 'ring-4 ring-white' : ''} cursor-pointer flex items-center justify-center text-white font-bold text-xs`}
              onClick={() => setSelectedBlock(block.id)}
            >
              {i === 0 && block.isTarget && <Car className="w-6 h-6" />}
            </div>
          );
        }
      } else {
        for (let i = 0; i < block.length; i++) {
          grid[block.row + i][block.col] = (
            <div
              className={`w-full h-full ${block.color} ${selectedBlock === block.id ? 'ring-4 ring-white' : ''} cursor-pointer`}
              onClick={() => setSelectedBlock(block.id)}
            />
          );
        }
      }
    });

    return grid;
  };

  const gridCells = renderGrid();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] flex flex-col items-center justify-center p-6 relative overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
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
          <Car className="w-12 h-12 text-[#8558ed]" />
          Unblock Me Quest
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[#8558ed]/80 font-medium flex items-center justify-center gap-2"
        >
          <Car className="w-5 h-5" />
          Move blocks to free the red car!
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
              className="bg-gradient-to-tr from-blue-500 to-cyan-500 w-10 h-10 rounded-full flex items-center justify-center"
            >
              <Target className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-xs text-[#030303]/60 font-medium">Moves</div>
              <div className="text-2xl font-bold text-blue-600">{moves}</div>
            </div>
          </div>
        </motion.div>

        {workingModel && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl px-6 py-3 shadow-lg shadow-[#8558ed]/10"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-tr from-purple-500 to-pink-500 w-10 h-10 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <div className="text-xs text-[#030303]/60 font-medium">AI Model</div>
                <div className="text-sm font-bold text-purple-600 truncate max-w-[150px]" title={workingModel}>
                  {workingModel}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

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
                <span><strong>Click a block</strong> to select it</span>
              </p>
              <p className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[#8558ed]" />
                <span><strong>Use arrow keys</strong> or buttons to move</span>
              </p>
              <p className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#8558ed]" />
                <span><strong>Move the red car</strong> to the exit!</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Game Board and Controls - Right Side */}
        <div className="flex flex-col items-center gap-6">
          {/* Game Board */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-2xl shadow-[#8558ed]/20 relative"
          >
            {isLoadingPuzzle && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[#8558ed] border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-[#8558ed] font-semibold">Generating puzzle with AI...</p>
                </motion.div>
              </div>
            )}
            <div className="grid grid-cols-6 gap-1.5 p-4 bg-gradient-to-br from-[#8558ed]/10 to-[#b18aff]/10 rounded-2xl" style={{ width: '400px', height: '400px' }}>
              {gridCells.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: (rowIndex * 6 + colIndex) * 0.01,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    className="bg-gradient-to-br from-white/60 to-gray-100/60 border-2 border-white/40 rounded-lg overflow-hidden"
                  >
                    {cell || <div className="w-full h-full" />}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Refresh Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex justify-center mb-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRefresh}
                disabled={isLoadingPuzzle}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingPuzzle ? 'animate-spin' : ''}`} />
                Refresh Puzzle
              </Button>
            </motion.div>
          </motion.div>

          {/* Control Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex gap-3"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => selectedBlock !== null && moveBlock(selectedBlock, 'up')}
                disabled={selectedBlock === null}
                className="w-14 h-14 bg-gradient-to-br from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white text-2xl font-bold rounded-xl shadow-lg disabled:opacity-50"
              >
                ↑
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => selectedBlock !== null && moveBlock(selectedBlock, 'down')}
                disabled={selectedBlock === null}
                className="w-14 h-14 bg-gradient-to-br from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white text-2xl font-bold rounded-xl shadow-lg disabled:opacity-50"
              >
                ↓
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => selectedBlock !== null && moveBlock(selectedBlock, 'left')}
                disabled={selectedBlock === null}
                className="w-14 h-14 bg-gradient-to-br from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white text-2xl font-bold rounded-xl shadow-lg disabled:opacity-50"
              >
                ←
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => selectedBlock !== null && moveBlock(selectedBlock, 'right')}
                disabled={selectedBlock === null}
                className="w-14 h-14 bg-gradient-to-br from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white text-2xl font-bold rounded-xl shadow-lg disabled:opacity-50"
              >
                →
              </Button>
            </motion.div>
          </motion.div>
        </div>
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
