import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, CheckCircle, Clock } from 'lucide-react';
import { AnimatedStatCard } from '@/components/ui/Charts';
import { ApplicantProfile, Assessment } from '@/types';

interface StatCardsProps {
  profiles: ApplicantProfile[];
  assessments: Assessment[];
}

export const StatCards: React.FC<StatCardsProps> = ({
  profiles,
  assessments
}) => {
  // Calculate statistics
  const totalCandidates = profiles.length;
  const completedAssessments = assessments.filter(a => a.completedAt).length;
  const inProgressAssessments = assessments.filter(a => !a.completedAt && Object.values(a.games).some(game => game !== null)).length;

  // Calculate average scores for completed assessments
  const completedGames = assessments.filter(a => a.completedAt);
  const totalAverageScore = completedGames.length > 0 
    ? Math.round(completedGames.reduce((sum, a) => sum + a.totalScore, 0) / completedGames.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <AnimatedStatCard
        title="Total Candidates"
        value={totalCandidates}
        icon={Users}
        color="teal"
        change={{ value: 12, trend: 'up' }}
      />
      
      <AnimatedStatCard
        title="Completed Assessments"
        value={completedAssessments}
        icon={CheckCircle}
        color="teal"
        change={{ value: 8, trend: 'up' }}
      />
      
      <AnimatedStatCard
        title="In Progress"
        value={inProgressAssessments}
        icon={Clock}
        color="orange"
      />
      
      <AnimatedStatCard
        title="Average Score"
        value={totalAverageScore}
        icon={Trophy}
        color="purple"
        change={totalAverageScore > 75 ? { value: 5, trend: 'up' } : undefined}
      />
    </motion.div>
  );
};
