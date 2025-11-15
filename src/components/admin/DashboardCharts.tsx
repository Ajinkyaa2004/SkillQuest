import React from 'react';
import { motion } from 'framer-motion';
import { Target, Award, Zap } from 'lucide-react';
import { 
  ProgressBarChart, 
  AssessmentCompletionChart,
  GamePerformanceChart,
  DailyEngagementChart 
} from '@/components/ui/Charts';
import { ApplicantProfile, Assessment } from '@/types';

interface DashboardChartsProps {
  profiles: ApplicantProfile[];
  assessments: Assessment[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  profiles,
  assessments
}) => {
  // Calculate statistics
  const totalCandidates = profiles.length;
  const completedAssessments = assessments.filter(a => a.completedAt).length;
  const inProgressAssessments = assessments.filter(a => !a.completedAt && Object.values(a.games).some(game => game !== null)).length;
  const notStartedAssessments = totalCandidates - completedAssessments - inProgressAssessments;

  // Calculate average scores for completed assessments
  const completedGames = assessments.filter(a => a.completedAt);
  const averageScores = {
    minesweeper: completedGames.length > 0 
      ? Math.round(completedGames.reduce((sum, a) => sum + (a.games.minesweeper?.puzzlesCompleted || 0), 0) / completedGames.length)
      : 0,
    waterCapacity: completedGames.length > 0 
      ? Math.round(completedGames.reduce((sum, a) => sum + (a.games['water-capacity']?.puzzlesCompleted || 0), 0) / completedGames.length)
      : 0,
  };

  // Mock daily engagement data (in a real app, this would come from your analytics)
  const mockDailyData = [
    { day: 'Mon', users: 12 },
    { day: 'Tue', users: 19 },
    { day: 'Wed', users: 15 },
    { day: 'Thu', users: 25 },
    { day: 'Fri', users: 22 },
    { day: 'Sat', users: 8 },
    { day: 'Sun', users: 5 }
  ];

  // Assessment status data for progress chart
  const statusData = [
    { label: 'Completed', value: completedAssessments },
    { label: 'In Progress', value: inProgressAssessments },
    { label: 'Not Started', value: notStartedAssessments }
  ];

  // Calculate completion rate percentage
  const completionRate = totalCandidates > 0 ? (completedAssessments / totalCandidates) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Main Charts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {/* Assessment Completion Circular Chart */}
        <AssessmentCompletionChart
          completed={completedAssessments}
          total={totalCandidates}
        />

        {/* Assessment Status Progress Bars */}
        <ProgressBarChart
          data={statusData}
          title="Assessment Status"
          subtitle="Current status of all candidates"
        />

        {/* Game Performance Chart */}
        <GamePerformanceChart
          minesweeper={averageScores.minesweeper}
          waterCapacity={averageScores.waterCapacity}
        />
      </motion.div>

      {/* Additional Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Daily Engagement Line Chart */}
        <DailyEngagementChart data={mockDailyData} />

        {/* Performance Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Performance Insights</h3>
          
          <div className="space-y-4">
            {/* Completion Rate */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-game-teal-50 to-game-teal-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-game-teal-400 to-game-teal-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Completion Rate</p>
                  <p className="text-sm text-gray-600">Overall assessment completion</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-game-teal-600">{Math.round(completionRate)}%</p>
                <p className="text-sm text-gray-600">of candidates</p>
              </div>
            </div>

            {/* Top Performing Game */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-game-orange-50 to-game-orange-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-game-orange-400 to-game-orange-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Top Game</p>
                  <p className="text-sm text-gray-600">Highest average score</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-game-orange-600">
                  {Object.entries(averageScores).reduce((a, b) => 
                    averageScores[a[0] as keyof typeof averageScores] > averageScores[b[0] as keyof typeof averageScores] ? a : b
                  )[0].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-sm text-gray-600">
                  Avg: {Math.max(...Object.values(averageScores))} points
                </p>
              </div>
            </div>

            {/* Engagement Level */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-game-purple-50 to-game-purple-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-game-purple-400 to-game-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Engagement Level</p>
                  <p className="text-sm text-gray-600">Based on completion rate</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-game-purple-600">
                  {completionRate > 80 ? 'Excellent' : 
                   completionRate > 60 ? 'Good' : 
                   completionRate > 40 ? 'Moderate' : 'Needs Improvement'}
                </p>
                <p className="text-sm text-gray-600">
                  {completedAssessments + inProgressAssessments} active
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
