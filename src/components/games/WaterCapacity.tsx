import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Sparkles, Zap, Star, Target, Droplet as DropletIcon } from 'lucide-react';
import { useTabSwitchDetection } from '@/hooks/useTabSwitchDetection';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  onComplete: (score: number, totalSteps: number, failed?: boolean, failureReason?: string) => void;
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
  const navigate = useNavigate();
  const [jugs, setJugs] = useState<Jug[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [steps, setSteps] = useState(0);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Tab switch detection - only enabled when not in trial mode
  useTabSwitchDetection({
    maxViolations: 3,
    enabled: !isTrialMode,
    onDisqualified: () => {
      // Mark as failed and navigate to assessment page
      onComplete(puzzlesCompleted, totalSteps, true, 'Disqualified due to tab switching violations');
      navigate('/applicant/assessment');
    },
  });

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
           animate-gradient-x drop-shadow-[0_0_25px_rgba(133,88,237,0.3)] tracking-tight mb-2"
        >
          💧 Water Capacity Quest
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[#8558ed]/80 font-medium flex items-center justify-center gap-2"
        >
          <DropletIcon className="w-5 h-5" />
          Measure the exact amount of water!
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
              <div className="text-xs text-[#030303]/60 font-medium">Puzzle</div>
              <div className="text-2xl font-bold text-[#8558ed]">{currentPuzzle + 1}</div>
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
              <div className="text-xs text-[#030303]/60 font-medium">Steps</div>
              <div className="text-2xl font-bold text-blue-600">{steps}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
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
                className="text-3xl"
              >
                🎉
              </motion.span>
              <span className="text-2xl font-bold">Puzzle Solved!</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-3xl"
              >
                ✨
              </motion.span>
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
                <span className="text-lg">💧</span>
                <span><strong>Fill</strong> jugs to their capacity</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-lg">🚰</span>
                <span><strong>Empty</strong> jugs completely</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                <span><strong>Pour</strong> water between jugs</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span>Reach the <strong>exact target</strong> amount!</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Game Board - Right Side */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl shadow-[#8558ed]/20"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-6 p-4 bg-gradient-to-r from-[#8558ed]/10 to-[#b18aff]/10 rounded-2xl border-2 border-[#8558ed]/20"
          >
            <p className="text-lg font-bold text-[#030303]">
              🎯 Goal: Get exactly <span className="text-[#8558ed] text-3xl mx-2">{puzzle.target}L</span> in Jug {puzzle.targetJug + 1}
            </p>
          </motion.div>

          <div className="flex justify-center gap-12">
            {jugs.map((jug, index) => (
              <motion.div
                key={jug.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="text-lg font-bold text-[#8558ed]">Jug {index + 1}</div>
                
                {/* Jug visualization */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-28 h-56 border-4 border-[#8558ed] rounded-b-2xl bg-gradient-to-b from-white/80 to-gray-100/80 overflow-hidden shadow-xl"
                >
                  <motion.div
                    className={`absolute bottom-0 w-full ${jug.color} transition-all duration-500`}
                    style={{ height: `${(jug.current / jug.capacity) * 100}%` }}
                    animate={{
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="text-xl font-extrabold text-[#030303] bg-white/90 px-3 py-1 rounded-lg shadow-lg border-2 border-[#8558ed]/30"
                    >
                      {jug.current}/{jug.capacity}L
                    </motion.span>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <div className="flex flex-col space-y-2 w-full">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => fillJug(jug.id)}
                      disabled={jug.current === jug.capacity}
                      className="w-full bg-gradient-to-r from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white disabled:opacity-50"
                    >
                      💧 Fill
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => emptyJug(jug.id)}
                      disabled={jug.current === 0}
                      variant="outline"
                      className="w-full border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10 disabled:opacity-50"
                    >
                      🚰 Empty
                    </Button>
                  </motion.div>
                  {jugs.map((targetJug) =>
                    targetJug.id !== jug.id ? (
                      <motion.div key={`pour-${jug.id}-${targetJug.id}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => pourJug(jug.id, targetJug.id)}
                          disabled={jug.current === 0 || targetJug.current === targetJug.capacity}
                          variant="secondary"
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white disabled:opacity-50"
                        >
                          Pour → {targetJug.id + 1}
                        </Button>
                      </motion.div>
                    ) : null
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={resetPuzzle} variant="outline" className="border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Puzzle
              </Button>
            </motion.div>
          </motion.div>
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
