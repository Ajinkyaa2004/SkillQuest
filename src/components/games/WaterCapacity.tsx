import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw } from 'lucide-react';

interface Jug {
  id: number;
  capacity: number;
  current: number;
  color: string;
}

interface Puzzle {
  jugs: { capacity: number; color: string }[];
  target: number;
  targetJug: number;
}

interface WaterCapacityProps {
  onComplete: (score: number, totalSteps: number) => void;
  timeRemaining: number;
  isTrialMode?: boolean;
}

const PUZZLES: Puzzle[] = [
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }], target: 4, targetJug: 1 },
  { jugs: [{ capacity: 4, color: 'bg-blue-400' }, { capacity: 7, color: 'bg-cyan-400' }], target: 5, targetJug: 1 },
  { jugs: [{ capacity: 2, color: 'bg-blue-400' }, { capacity: 5, color: 'bg-cyan-400' }], target: 1, targetJug: 0 },
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 8, color: 'bg-cyan-400' }], target: 7, targetJug: 1 },
  { jugs: [{ capacity: 5, color: 'bg-blue-400' }, { capacity: 7, color: 'bg-cyan-400' }], target: 6, targetJug: 1 },
  { jugs: [{ capacity: 4, color: 'bg-blue-400' }, { capacity: 9, color: 'bg-cyan-400' }], target: 6, targetJug: 1 },
  { jugs: [{ capacity: 3, color: 'bg-blue-400' }, { capacity: 10, color: 'bg-cyan-400' }], target: 7, targetJug: 1 },
  { jugs: [{ capacity: 6, color: 'bg-blue-400' }, { capacity: 8, color: 'bg-cyan-400' }], target: 4, targetJug: 0 },
  { jugs: [{ capacity: 5, color: 'bg-blue-400' }, { capacity: 11, color: 'bg-cyan-400' }], target: 8, targetJug: 1 },
  { jugs: [{ capacity: 7, color: 'bg-blue-400' }, { capacity: 9, color: 'bg-cyan-400' }], target: 5, targetJug: 0 },
];

export const WaterCapacity: React.FC<WaterCapacityProps> = ({ onComplete, timeRemaining, isTrialMode = false }) => {
  const [jugs, setJugs] = useState<Jug[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [steps, setSteps] = useState(0);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const initializePuzzle = useCallback((puzzleIndex: number) => {
    const puzzle = PUZZLES[puzzleIndex % PUZZLES.length];
    const newJugs: Jug[] = puzzle.jugs.map((jug, index) => ({
      id: index,
      capacity: jug.capacity,
      current: 0,
      color: jug.color,
    }));
    setJugs(newJugs);
    setSteps(0);
  }, []);

  useEffect(() => {
    initializePuzzle(currentPuzzle);
  }, [currentPuzzle, initializePuzzle]);

  useEffect(() => {
    if (timeRemaining === 0 && !isTrialMode) {
      onComplete(puzzlesCompleted, totalSteps);
    }
  }, [timeRemaining, puzzlesCompleted, totalSteps, onComplete, isTrialMode]);

  useEffect(() => {
    const puzzle = PUZZLES[currentPuzzle % PUZZLES.length];
    const targetJug = jugs[puzzle.targetJug];
    
    if (targetJug && targetJug.current === puzzle.target) {
      setShowSuccess(true);
      setTimeout(() => {
        setPuzzlesCompleted(prev => prev + 1);
        setCurrentPuzzle(prev => prev + 1);
        setShowSuccess(false);
      }, 1500);
    }
  }, [jugs, currentPuzzle]);

  const fillJug = (jugId: number) => {
    const newJugs = jugs.map(jug =>
      jug.id === jugId ? { ...jug, current: jug.capacity } : jug
    );
    setJugs(newJugs);
    setSteps(prev => prev + 1);
    setTotalSteps(prev => prev + 1);
  };

  const emptyJug = (jugId: number) => {
    const newJugs = jugs.map(jug =>
      jug.id === jugId ? { ...jug, current: 0 } : jug
    );
    setJugs(newJugs);
    setSteps(prev => prev + 1);
    setTotalSteps(prev => prev + 1);
  };

  const pourJug = (fromId: number, toId: number) => {
    const fromJug = jugs[fromId];
    const toJug = jugs[toId];

    if (fromJug.current === 0 || toJug.current === toJug.capacity) return;

    const amountToPour = Math.min(fromJug.current, toJug.capacity - toJug.current);
    
    const newJugs = jugs.map(jug => {
      if (jug.id === fromId) {
        return { ...jug, current: jug.current - amountToPour };
      } else if (jug.id === toId) {
        return { ...jug, current: jug.current + amountToPour };
      }
      return jug;
    });

    setJugs(newJugs);
    setSteps(prev => prev + 1);
    setTotalSteps(prev => prev + 1);
  };

  const resetPuzzle = () => {
    initializePuzzle(currentPuzzle);
  };

  const puzzle = PUZZLES[currentPuzzle % PUZZLES.length];

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-lg font-semibold">
          <Trophy className="inline w-5 h-5 mr-2 text-yellow-500" />
          Puzzle: {currentPuzzle + 1}
        </div>
        <div className="text-lg font-semibold">
          Completed: {puzzlesCompleted}
        </div>
        <div className="text-lg font-semibold">
          Steps: {steps}
        </div>
      </div>

      {showSuccess && (
        <div className="text-2xl font-bold text-green-600 animate-pulse">
          Puzzle Solved! 🎉
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-300">
        <div className="text-center mb-4">
          <p className="text-lg font-semibold">
            Goal: Get exactly <span className="text-blue-600 text-2xl">{puzzle.target}</span> liters in Jug {puzzle.targetJug + 1}
          </p>
        </div>

        <div className="flex justify-center space-x-8">
          {jugs.map((jug, index) => (
            <div key={jug.id} className="flex flex-col items-center space-y-3">
              <div className="text-sm font-semibold">Jug {index + 1}</div>
              
              {/* Jug visualization */}
              <div className="relative w-24 h-48 border-4 border-gray-700 rounded-b-lg bg-gray-100 overflow-hidden">
                <div
                  className={`absolute bottom-0 w-full ${jug.color} transition-all duration-300`}
                  style={{ height: `${(jug.current / jug.capacity) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-800 bg-white bg-opacity-70 px-2 rounded">
                    {jug.current}/{jug.capacity}L
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col space-y-2 w-full">
                <Button
                  onClick={() => fillJug(jug.id)}
                  disabled={jug.current === jug.capacity}
                  size="sm"
                  className="w-full"
                >
                  Fill
                </Button>
                <Button
                  onClick={() => emptyJug(jug.id)}
                  disabled={jug.current === 0}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Empty
                </Button>
                {jugs.map((targetJug) =>
                  targetJug.id !== jug.id ? (
                    <Button
                      key={`pour-${jug.id}-${targetJug.id}`}
                      onClick={() => pourJug(jug.id, targetJug.id)}
                      disabled={jug.current === 0 || targetJug.current === targetJug.capacity}
                      size="sm"
                      variant="secondary"
                      className="w-full"
                    >
                      Pour → {targetJug.id + 1}
                    </Button>
                  ) : null
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={resetPuzzle} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Puzzle
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-600 text-center max-w-md">
        <p><strong>How to play:</strong> Use Fill, Empty, and Pour buttons to transfer water between jugs.</p>
        <p>Achieve the exact target amount in the specified jug to complete the puzzle!</p>
      </div>
    </div>
  );
};
