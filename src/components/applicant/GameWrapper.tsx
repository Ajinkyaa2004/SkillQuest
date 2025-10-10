import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getAssessmentByUserId, saveAssessment } from '@/lib/storage';
import { GameType, GameScore } from '@/types';
import { formatTime, calculateTotalScore } from '@/lib/utils';
import { Minesweeper } from '@/components/games/Minesweeper';
import { UnblockMe } from '@/components/games/UnblockMe';
import { WaterCapacity } from '@/components/games/WaterCapacity';
import { AlertTriangle, Maximize, X, Sparkles, Zap, Clock, Target, Shield, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const GAME_DURATION = 300; // 5 minutes in seconds

export const GameWrapper: React.FC = () => {
  const { gameType } = useParams<{ gameType: GameType }>();
  const [searchParams] = useSearchParams();
  const isTrial = searchParams.get('trial') === 'true';
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);

  useEffect(() => {
    if (!user || !gameType) {
      navigate('/');
      return;
    }

    const assessment = getAssessmentByUserId(user.id);
    if (!assessment) {
      navigate('/applicant/assessment');
      return;
    }

    // Check if game is unlocked
    if (gameType === 'unblock-me' && !assessment.games.minesweeper) {
      navigate('/applicant/assessment');
      return;
    }
    if (gameType === 'water-capacity' && !assessment.games['unblock-me']) {
      navigate('/applicant/assessment');
      return;
    }

    // Check if already completed (for scored mode)
    if (!isTrial && assessment.games[gameType]) {
      navigate('/applicant/assessment');
      return;
    }
  }, [user, gameType, navigate, isTrial]);

  // Timer
  useEffect(() => {
    if (!gameStarted || isTrial) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, isTrial]);

  // Fullscreen monitoring
  useEffect(() => {
    if (!gameStarted || isTrial) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && gameStarted) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [gameStarted, isTrial]);

  // Tab switching detection
  useEffect(() => {
    if (!gameStarted || isTrial) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setIsDisqualified(true);
            toast.error('You have been disqualified for excessive tab switching.', {
              duration: 5000,
              icon: '🚫',
            });
            navigate('/applicant/assessment');
          } else {
            setShowWarning(true);
            toast.warning(`Warning ${newCount}/3: Tab switching detected. Further violations will result in disqualification.`, {
              duration: 4000,
              icon: '⚠️',
            });
            setTimeout(() => setShowWarning(false), 3000);
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameStarted, navigate, isTrial]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setGameStarted(true);
    } catch (err) {
      toast.error('Please enable fullscreen to start the assessment.', {
        duration: 4000,
        icon: '📺',
      });
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  const handleGameComplete = useCallback((score: number, metadata: number, failed?: boolean, failureReason?: string) => {
    if (!user || !gameType || isTrial) {
      if (isTrial) {
        exitFullscreen();
        navigate('/applicant/assessment');
      }
      return;
    }

    const assessment = getAssessmentByUserId(user.id);
    if (!assessment) return;

    const gameScore: GameScore = {
      gameType,
      puzzlesCompleted: score,
      timeSpent: GAME_DURATION - timeRemaining,
      errorRate: gameType === 'minesweeper' ? metadata : undefined,
      minimumMoves: gameType !== 'minesweeper' ? metadata : undefined,
      completedAt: new Date().toISOString(),
      trialCompleted: false,
      failed: failed || false,
      failureReason: failureReason,
    };

    assessment.games[gameType] = gameScore;

    // Calculate total score if all games completed
    if (assessment.games.minesweeper && assessment.games['unblock-me'] && assessment.games['water-capacity']) {
      assessment.totalScore = calculateTotalScore(
        assessment.games.minesweeper.puzzlesCompleted,
        assessment.games['unblock-me'].puzzlesCompleted,
        assessment.games['water-capacity'].puzzlesCompleted
      );
      assessment.completedAt = new Date().toISOString();
    }

    saveAssessment(assessment);
    exitFullscreen();
    navigate('/applicant/assessment');
  }, [user, gameType, timeRemaining, navigate, isTrial]);

  const quitGame = () => {
    toast.warning('Progress will not be saved if you quit now!', {
      duration: 3000,
      icon: '⚠️',
      action: {
        label: 'Quit Anyway',
        onClick: () => {
          exitFullscreen();
          navigate('/applicant/assessment');
        },
      },
    });
  };

  const getGameTitle = () => {
    switch (gameType) {
      case 'minesweeper': return 'Minesweeper';
      case 'unblock-me': return 'Unblock Me';
      case 'water-capacity': return 'Water Capacity';
      default: return 'Game';
    }
  };

  const renderGame = () => {
    switch (gameType) {
      case 'minesweeper':
        return <Minesweeper onComplete={handleGameComplete} timeRemaining={timeRemaining} isTrialMode={isTrial} />;
      case 'unblock-me':
        return <UnblockMe onComplete={handleGameComplete} timeRemaining={timeRemaining} isTrialMode={isTrial} />;
      case 'water-capacity':
        return <WaterCapacity onComplete={handleGameComplete} timeRemaining={timeRemaining} isTrialMode={isTrial} />;
      default:
        return <div>Invalid game type</div>;
    }
  };

  if (!gameStarted && !isTrial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] flex items-center justify-center p-6 relative overflow-hidden">
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
          <Target className="w-7 h-7 text-[#8558ed]/30" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-white/80 backdrop-blur-xl border-2 border-[#8558ed]/30 shadow-2xl shadow-[#8558ed]/20">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8558ed] via-[#b18aff] to-[#8558ed] mb-2 flex items-center justify-center gap-3">
                  <Sparkles className="w-10 h-10 text-[#8558ed]" />
                  Ready to Start
                </CardTitle>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-[#8558ed] flex items-center justify-center gap-2"
                >
                  <Rocket className="w-6 h-6" />
                  {getGameTitle()}
                </motion.p>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rules Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-gradient-to-br from-[#8558ed]/10 to-[#b18aff]/10 border-2 border-[#8558ed]/30 rounded-2xl"
              >
                <div className="flex items-start space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-gradient-to-tr from-[#8558ed] to-[#b18aff] w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <Shield className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-[#8558ed] mb-3">📋 Important Assessment Rules:</p>
                    <ul className="space-y-3">
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-start gap-3 text-[#030303]/80"
                      >
                        <Clock className="w-5 h-5 text-[#8558ed] mt-0.5 flex-shrink-0" />
                        <span>This game will run for exactly <strong className="text-[#8558ed]">5 minutes</strong></span>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-start gap-3 text-[#030303]/80"
                      >
                        <Maximize className="w-5 h-5 text-[#8558ed] mt-0.5 flex-shrink-0" />
                        <span>You must play in <strong className="text-[#8558ed]">fullscreen mode</strong></span>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-start gap-3 text-[#030303]/80"
                      >
                        <AlertTriangle className="w-5 h-5 text-[#8558ed] mt-0.5 flex-shrink-0" />
                        <span>Tab switching is monitored and limited to <strong className="text-[#8558ed]">2 warnings</strong></span>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-start gap-3 text-[#030303]/80"
                      >
                        <Target className="w-5 h-5 text-[#8558ed] mt-0.5 flex-shrink-0" />
                        <span>Your score is based on <strong className="text-[#8558ed]">puzzles/levels completed</strong></span>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-start gap-3 text-[#030303]/80"
                      >
                        <Zap className="w-5 h-5 text-[#8558ed] mt-0.5 flex-shrink-0" />
                        <span>The timer <strong className="text-[#8558ed]">cannot be paused</strong> once started</span>
                      </motion.li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={enterFullscreen}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white shadow-lg shadow-[#8558ed]/30"
                  >
                    <Maximize className="w-5 h-5 mr-2" />
                    Enter Fullscreen & Start
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => navigate('/applicant/assessment')}
                    variant="outline"
                    className="h-14 px-8 text-lg font-bold border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </Button>
                </motion.div>
              </motion.div>

              {/* Good Luck Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-lg font-bold text-[#8558ed] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Good Luck! You've got this!
                  <Rocket className="w-5 h-5" />
                </motion.p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with timer and warnings */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">{getGameTitle()}</h2>
            {isTrial && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                Practice Mode
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {!isTrial && (
              <>
                <div className={`text-2xl font-mono font-bold ${timeRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </div>
                {tabSwitchCount > 0 && (
                  <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                    Warnings: {tabSwitchCount}/3
                  </div>
                )}
              </>
            )}
            <Button onClick={quitGame} variant="destructive" size="sm">
              <X className="w-4 h-4 mr-2" />
              Quit
            </Button>
          </div>
        </div>
      </div>

      {/* Warning overlay */}
      {showWarning && !isTrial && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Warning: Stay in fullscreen and on this tab!</span>
          </div>
        </div>
      )}

      {/* Game content */}
      <div className="py-8">
        {renderGame()}
      </div>
    </div>
  );
};
