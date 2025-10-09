import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getAssessmentByUserId, getProfileByUserId } from '@/lib/storage';
import { Assessment, ApplicantProfile } from '@/types';
import { Trophy, CheckCircle, Clock, Target, LogOut } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const Results: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const userProfile = getProfileByUserId(user.id);
    const userAssessment = getAssessmentByUserId(user.id);

    if (!userProfile || !userAssessment || !userAssessment.completedAt) {
      navigate('/applicant/assessment');
      return;
    }

    setProfile(userProfile);
    setAssessment(userAssessment);
  }, [user, navigate]);

  if (!assessment || !profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const games = [
    {
      type: 'minesweeper',
      title: 'Minesweeper',
      icon: '💣',
      skill: 'Risk Assessment & Deductive Logic',
      score: assessment.games.minesweeper,
    },
    {
      type: 'unblock-me',
      title: 'Unblock Me',
      icon: '🚗',
      skill: 'Spatial Reasoning & Planning',
      score: assessment.games['unblock-me'],
    },
    {
      type: 'water-capacity',
      title: 'Water Capacity',
      icon: '💧',
      skill: 'Logical Sequencing & Optimization',
      score: assessment.games['water-capacity'],
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 15) return 'text-green-600';
    if (score >= 10) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 15) return 'Excellent';
    if (score >= 10) return 'Good';
    if (score >= 5) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
            <p className="text-gray-600 mt-2">
              Candidate ID: <span className="font-mono font-semibold">{profile.candidateId}</span>
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center">
              <Trophy className="w-8 h-8 mr-3" />
              Total Assessment Score
            </CardTitle>
            <CardDescription className="text-blue-100">
              Completed on {formatDate(assessment.completedAt!)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold mb-2">{assessment.totalScore}</div>
            <div className="text-xl">out of 100 points</div>
          </CardContent>
        </Card>

        {/* Individual Game Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {games.map((game) => (
            <Card key={game.type}>
              <CardHeader>
                <div className="text-4xl mb-2">{game.icon}</div>
                <CardTitle className="text-xl">{game.title}</CardTitle>
                <CardDescription>{game.skill}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {game.score && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Puzzles Completed:</span>
                      <span className={`text-2xl font-bold ${getScoreColor(game.score.puzzlesCompleted)}`}>
                        {game.score.puzzlesCompleted}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Performance:</span>
                      <span className={`font-semibold ${getScoreColor(game.score.puzzlesCompleted)}`}>
                        {getScoreLabel(game.score.puzzlesCompleted)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {Math.floor(game.score.timeSpent / 60)}:{(game.score.timeSpent % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    {game.score.errorRate !== undefined && (
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Errors:</span>
                        <span>{game.score.errorRate}</span>
                      </div>
                    )}
                    {game.score.minimumMoves !== undefined && (
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Total Moves:</span>
                        <span>{game.score.minimumMoves}</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completion Status */}
        <Card className="mb-6 bg-green-50 border-green-300">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="w-6 h-6 mr-2" />
              Assessment Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✅ All three cognitive games completed successfully</p>
            <p>✅ Your results have been recorded and submitted</p>
            <p>✅ Recruiters can now view your performance on the leaderboard</p>
            <p className="mt-4 font-semibold">
              Thank you for completing the IFA Hiring Platform assessment. We will review your performance and contact you soon!
            </p>
          </CardContent>
        </Card>

        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Name:</strong> {profile.name}
            </div>
            <div>
              <strong>Email:</strong> {profile.email}
            </div>
            <div>
              <strong>College:</strong> {profile.collegeName}
            </div>
            <div>
              <strong>CGPA:</strong> {profile.cgpa}
            </div>
            <div>
              <strong>Location:</strong> {profile.location}
            </div>
            <div>
              <strong>Telegram ID:</strong> {profile.telegramId}
            </div>
            <div className="md:col-span-2">
              <strong>Interested Roles:</strong> {profile.interestedRoles.join(', ')}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigate('/applicant/assessment')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
