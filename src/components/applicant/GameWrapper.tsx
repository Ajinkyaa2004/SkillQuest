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
import { AlertTriangle, Maximize, X } from 'lucide-react';

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
            alert('You have been disqualified for excessive tab switching.');
            navigate('/applicant/assessment');
          } else {
            setShowWarning(true);
            alert(`Warning ${newCount}/3: Tab switching detected. Further violations will result in disqualification.`);
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
      alert('Please enable fullscreen to start the assessment.');
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  const handleGameComplete = useCallback((score: number, metadata: number) => {
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
    if (confirm('Are you sure you want to quit? Your progress will not be saved.')) {
      exitFullscreen();
      navigate('/applicant/assessment');
    }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Start: {getGameTitle()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-2">Important Assessment Rules:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>This game will run for exactly <strong>5 minutes</strong></li>
                    <li>You must play in <strong>fullscreen mode</strong></li>
                    <li>Tab switching is monitored and limited to 2 warnings</li>
                    <li>Your score is based on puzzles/levels completed</li>
                    <li>The timer cannot be paused once started</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={enterFullscreen} className="flex-1">
                <Maximize className="w-4 h-4 mr-2" />
                Enter Fullscreen & Start
              </Button>
              <Button onClick={() => navigate('/applicant/assessment')} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
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
