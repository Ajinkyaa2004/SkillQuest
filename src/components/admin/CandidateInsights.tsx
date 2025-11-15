import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApplicantProfile, Assessment } from '@/types';
import { Clock, Users, Bomb, Car, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';

interface CandidateInsightsProps {
  profiles: ApplicantProfile[];
  assessments: Assessment[];
}

interface GameTimeData {
  name: string;
  minesweeper: number;
  waterCapacity: number;
}

export const CandidateInsights: React.FC<CandidateInsightsProps> = ({ profiles, assessments }) => {
  // Calculate time spent data for each candidate
  const getTimeSpentData = (): GameTimeData[] => {
    return profiles
      .map(profile => {
        const assessment = assessments.find(a => a.userId === profile.userId);
        if (!assessment) return null;

        return {
          name: profile.name,
          minesweeper: assessment.games.minesweeper?.timeSpent || 0,
          waterCapacity: assessment.games['water-capacity']?.timeSpent || 0,
        };
      })
      .filter(Boolean) as GameTimeData[];
  };

  const timeData = getTimeSpentData();

  // Calculate average times for each game
  const avgTimes = {
    minesweeper: timeData.reduce((sum, item) => sum + item.minesweeper, 0) / timeData.length || 0,
    waterCapacity: timeData.reduce((sum, item) => sum + item.waterCapacity, 0) / timeData.length || 0,
  };

  // Format time in minutes and seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get the maximum time for scaling the bars
  const maxTime = Math.max(
    ...timeData.flatMap(item => [item.minesweeper, item.waterCapacity])
  );

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-xl border-2 border-game-purple-500/30 shadow-xl shadow-game-purple-500/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-game-purple-700 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Candidate Time Insights
          </CardTitle>
          <CardDescription className="text-game-purple-600/70 font-medium">
            Time spent analysis for each game across all candidates
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Average Time Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-game-purple-500/5 to-game-purple-400/5 border-2 border-game-purple-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-game-purple-600 to-game-purple-500 rounded-full flex items-center justify-center">
                  <Bomb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-game-purple-700">Minesweeper</h3>
                  <p className="text-2xl font-extrabold text-game-purple-600">{formatTime(Math.round(avgTimes.minesweeper))}</p>
                  <p className="text-sm text-gray-600">Average Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-game-teal-500/5 to-game-teal-400/5 border-2 border-game-teal-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-game-teal-600 to-game-teal-500 rounded-full flex items-center justify-center">
                  <Droplet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-game-teal-700">Water Capacity</h3>
                  <p className="text-2xl font-extrabold text-game-teal-600">{formatTime(Math.round(avgTimes.waterCapacity))}</p>
                  <p className="text-sm text-gray-600">Average Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Individual Candidate Time Chart */}
      <Card className="bg-white/80 backdrop-blur-xl border-2 border-game-purple-500/30 shadow-xl shadow-game-purple-500/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-game-purple-700 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Time Spent by Each Candidate
          </CardTitle>
          <CardDescription className="text-game-purple-600/70">
            Interactive chart showing time spent on each game per candidate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {timeData.map((candidate, index) => (
              <motion.div
                key={candidate.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <h4 className="font-semibold text-gray-800 mb-3">{candidate.name}</h4>
                
                {/* Minesweeper Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-game-purple-700 flex items-center gap-2">
                      <Bomb className="w-4 h-4" />
                      Minesweeper
                    </span>
                    <span className="text-sm font-bold text-game-purple-600">
                      {formatTime(candidate.minesweeper)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(candidate.minesweeper / maxTime) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-game-purple-600 to-game-purple-500 h-2 rounded-full"
                    />
                  </div>
                </div>

                {/* Water Capacity Bar */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-game-teal-700 flex items-center gap-2">
                      <Droplet className="w-4 h-4" />
                      Water Capacity
                    </span>
                    <span className="text-sm font-bold text-game-teal-600">
                      {formatTime(candidate.waterCapacity)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(candidate.waterCapacity / maxTime) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                      className="bg-gradient-to-r from-game-teal-600 to-game-teal-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
