import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw } from 'lucide-react';

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
  onComplete: (score: number, totalMoves: number) => void;
  timeRemaining: number;
  isTrialMode?: boolean;
}

const GRID_SIZE = 6;
const TARGET_ROW = 2;
const TARGET_EXIT_COL = 5;

export const UnblockMe: React.FC<UnblockMeProps> = ({ onComplete, timeRemaining, isTrialMode = false }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState(1);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);

  const generatePuzzle = useCallback((difficulty: number): Block[] => {
    const newBlocks: Block[] = [];
    const grid: boolean[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));

    // Add target block (red car)
    const targetBlock: Block = {
      id: 0,
      row: TARGET_ROW,
      col: 0,
      length: 2,
      orientation: 'horizontal',
      isTarget: true,
      color: 'bg-red-500',
    };
    newBlocks.push(targetBlock);
    for (let i = 0; i < targetBlock.length; i++) {
      grid[targetBlock.row][targetBlock.col + i] = true;
    }

    // Add blocking blocks
    const blockCount = Math.min(5 + difficulty, 12);
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];
    
    for (let i = 1; i < blockCount; i++) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 50) {
        const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        const length = Math.random() > 0.5 ? 2 : 3;
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        // Check if block can be placed
        let canPlace = true;
        if (orientation === 'horizontal') {
          if (col + length > GRID_SIZE) canPlace = false;
          else {
            for (let j = 0; j < length; j++) {
              if (grid[row][col + j]) {
                canPlace = false;
                break;
              }
            }
          }
        } else {
          if (row + length > GRID_SIZE) canPlace = false;
          else {
            for (let j = 0; j < length; j++) {
              if (grid[row + j][col]) {
                canPlace = false;
                break;
              }
            }
          }
        }

        if (canPlace) {
          const block: Block = {
            id: i,
            row,
            col,
            length,
            orientation,
            isTarget: false,
            color: colors[i % colors.length],
          };
          newBlocks.push(block);
          
          if (orientation === 'horizontal') {
            for (let j = 0; j < length; j++) {
              grid[row][col + j] = true;
            }
          } else {
            for (let j = 0; j < length; j++) {
              grid[row + j][col] = true;
            }
          }
          placed = true;
        }
        attempts++;
      }
    }

    return newBlocks;
  }, []);

  useEffect(() => {
    setBlocks(generatePuzzle(level - 1));
    setMoves(0);
  }, [level, generatePuzzle]);

  useEffect(() => {
    if (timeRemaining === 0 && !isTrialMode) {
      onComplete(puzzlesCompleted, totalMoves);
    }
  }, [timeRemaining, puzzlesCompleted, totalMoves, onComplete, isTrialMode]);

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
              {i === 0 && block.isTarget && '🚗'}
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
    <div className="flex flex-col items-center space-y-4 p-4" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-lg font-semibold">
          <Trophy className="inline w-5 h-5 mr-2 text-yellow-500" />
          Level: {level}
        </div>
        <div className="text-lg font-semibold">
          Puzzles Completed: {puzzlesCompleted}
        </div>
        <div className="text-lg font-semibold">
          Moves: {moves}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1 p-4 bg-gray-800 rounded-lg" style={{ width: '384px', height: '384px' }}>
        {gridCells.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="bg-gray-700 border border-gray-600 rounded"
            >
              {cell || <div className="w-full h-full" />}
            </div>
          ))
        )}
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={() => selectedBlock !== null && moveBlock(selectedBlock, 'up')}
          disabled={selectedBlock === null}
          size="sm"
        >
          ↑
        </Button>
        <Button
          onClick={() => selectedBlock !== null && moveBlock(selectedBlock, 'down')}
          disabled={selectedBlock === null}
          size="sm"
        >
          ↓
        </Button>
        <Button
          onClick={() => selectedBlock !== null && moveBlock(selectedBlock, 'left')}
          disabled={selectedBlock === null}
          size="sm"
        >
          ←
        </Button>
        <Button
          onClick={() => selectedBlock !== null && moveBlock(selectedBlock, 'right')}
          disabled={selectedBlock === null}
          size="sm"
        >
          →
        </Button>
      </div>

      <div className="text-sm text-gray-600 text-center max-w-md">
        <p><strong>How to play:</strong> Click a block to select it, then use arrow buttons or keyboard arrows to move.</p>
        <p>Move the red car to the exit on the right!</p>
      </div>
    </div>
  );
};
