import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileByUserId, getAssessmentByUserId, saveAssessment } from '@/lib/storage';
import { Assessment, GameType } from '@/types';
import { Lock, Play, CheckCircle, Trophy, LogOut } from 'lucide-react';
import { generateCandidateId } from '@/lib/utils';

export const AssessmentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const userProfile = getProfileByUserId(user.id);
    if (!userProfile || !userProfile.profileCompleted) {
      navigate('/applicant/profile');
      return;
    }
    setProfile(userProfile);

    let userAssessment = getAssessmentByUserId(user.id);
    if (!userAssessment) {
      userAssessment = {
        userId: user.id,
        candidateId: userProfile.candidateId,
        games: {
          minesweeper: null,
          'unblock-me': null,
          'water-capacity': null,
        },
        totalScore: 0,
        trialMode: {
          minesweeper: false,
          'unblock-me': false,
          'water-capacity': false,
        },
      };
      saveAssessment(userAssessment);
    }
    setAssessment(userAssessment);
  }, [user, navigate]);

  const isGameUnlocked = (gameType: GameType): boolean => {
    if (!assessment) return false;
    
    if (gameType === 'minesweeper') return true;
    if (gameType === 'unblock-me') {
      return assessment.games.minesweeper !== null;
    }
    if (gameType === 'water-capacity') {
      return assessment.games['unblock-me'] !== null;
    }
    return false;
  };

  const isTrialUnlocked = (gameType: GameType): boolean => {
    if (!assessment) return false;
    
    if (gameType === 'minesweeper') return true;
    if (gameType === 'unblock-me') {
      return assessment.games.minesweeper !== null;
    }
    if (gameType === 'water-capacity') {
      return assessment.games['unblock-me'] !== null;
    }
    return false;
  };

  const isGameCompleted = (gameType: GameType): boolean => {
    return assessment?.games[gameType] !== null;
  };

  const startGame = (gameType: GameType, isTrial: boolean = false) => {
    navigate(`/applicant/game/${gameType}${isTrial ? '?trial=true' : ''}`);
  };

  const viewResults = () => {
    navigate('/applicant/results');
  };

  const allGamesCompleted = assessment?.games.minesweeper !== null &&
    assessment?.games['unblock-me'] !== null &&
    assessment?.games['water-capacity'] !== null;

  const games = [
    {
      type: 'minesweeper' as GameType,
      title: 'Minesweeper',
      description: 'Test your risk assessment and deductive logic',
      skill: 'Risk Assessment & Deductive Logic',
      icon: '💣',
    },
    {
      type: 'unblock-me' as GameType,
      title: 'Unblock Me',
      description: 'Challenge your spatial reasoning and planning',
      skill: 'Spatial Reasoning & Planning',
      icon: '🚗',
    },
    {
      type: 'water-capacity' as GameType,
      title: 'Water Capacity',
      description: 'Solve logical sequencing and optimization puzzles',
      skill: 'Logical Sequencing & Optimization',
      icon: '💧',
    },
  ];

  if (!assessment || !profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cognitive Assessment</h1>
            <p className="text-gray-600 mt-2">
              Welcome, {profile.name} | Candidate ID: <span className="font-mono font-semibold">{profile.candidateId}</span>
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {allGamesCompleted && (
          <Card className="mb-6 bg-green-50 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <CheckCircle className="w-6 h-6 mr-2" />
                Assessment Complete!
              </CardTitle>
              <CardDescription>
                Congratulations! You have completed all three games. Click below to view your results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={viewResults} className="bg-green-600 hover:bg-green-700">
                <Trophy className="w-4 h-4 mr-2" />
                View Results
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {games.map((game, index) => {
            const unlocked = isGameUnlocked(game.type);
            const completed = isGameCompleted(game.type);
            const trialUnlocked = isTrialUnlocked(game.type);
            const score = assessment.games[game.type];

            return (
              <Card key={game.type} className={`${!unlocked ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl">{game.icon}</div>
                    {!unlocked && <Lock className="w-6 h-6 text-gray-400" />}
                    {completed && <CheckCircle className="w-6 h-6 text-green-600" />}
                  </div>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>Skill Tested:</strong> {game.skill}
                  </div>
                  <div className="text-sm">
                    <strong>Duration:</strong> 5 minutes
                  </div>
                  
                  {completed && score && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <div className="text-sm font-semibold text-blue-900">
                        Score: {score.puzzlesCompleted} puzzles completed
                      </div>
                      <div className="text-xs text-blue-700">
                        Time: {Math.floor(score.timeSpent / 60)}:{(score.timeSpent % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      onClick={() => startGame(game.type, false)}
                      disabled={!unlocked || completed}
                      className="w-full"
                    >
                      {completed ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : !unlocked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Locked
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Assessment
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => startGame(game.type, true)}
                      disabled={!trialUnlocked}
                      variant="outline"
                      className="w-full"
                    >
                      {!trialUnlocked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Trial Locked
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Try Practice Mode
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Each game runs for exactly <strong>5 minutes</strong>.</p>
            <p>• Games are unlocked sequentially - complete one to unlock the next.</p>
            <p>• Trial mode is available after completing the scored version of the previous game.</p>
            <p>• The assessment must be completed in <strong>full-screen mode</strong>.</p>
            <p>• Tab switching during assessment may result in disqualification.</p>
            <p>• Your score is based on the number of puzzles/levels completed within the time limit.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
