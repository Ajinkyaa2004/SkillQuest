import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Target, BookOpen, UserPlus, BarChart3, Star } from 'lucide-react';

interface EmptyStateProps {
  type: 'candidates' | 'leaderboard' | 'assessments' | 'applications' | 'achievements' | 'analytics';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
}

// Soft illustrated SVG components
const CandidatesIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={className}
    viewBox="0 0 200 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background circles */}
    <motion.circle
      cx="100" cy="75" r="60"
      fill="url(#tealGradient)"
      opacity="0.1"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.circle
      cx="130" cy="50" r="30"
      fill="url(#orangeGradient)"
      opacity="0.15"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />
    
    {/* Main illustration */}
    <motion.path
      d="M70 90 Q70 70 90 70 Q110 70 110 90 Q110 110 90 110 Q70 110 70 90Z"
      fill="url(#tealGradient)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
    <motion.circle
      cx="90" cy="85" r="8"
      fill="white"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 300 }}
    />
    
    {/* Floating elements */}
    <motion.rect
      x="120" y="65" width="20" height="15" rx="3"
      fill="url(#purpleGradient)"
      animate={{ y: [65, 60, 65] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <defs>
      <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#5eead4" />
      </linearGradient>
      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#fb923c" />
      </linearGradient>
      <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
    </defs>
  </motion.svg>
);

const LeaderboardIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={className}
    viewBox="0 0 200 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Podium */}
    <motion.rect
      x="80" y="80" width="40" height="50" rx="4"
      fill="url(#goldGradient)"
      initial={{ height: 0, y: 130 }}
      animate={{ height: 50, y: 80 }}
      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
    />
    <motion.rect
      x="40" y="95" width="35" height="35" rx="4"
      fill="url(#silverGradient)"
      initial={{ height: 0, y: 130 }}
      animate={{ height: 35, y: 95 }}
      transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
    />
    <motion.rect
      x="125" y="105" width="35" height="25" rx="4"
      fill="url(#bronzeGradient)"
      initial={{ height: 0, y: 130 }}
      animate={{ height: 25, y: 105 }}
      transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
    />
    
    {/* Trophy */}
    <motion.circle
      cx="100" cy="70" r="8"
      fill="url(#goldGradient)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 300 }}
    />
    
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#fbbf24" />
      </linearGradient>
      <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6b7280" />
        <stop offset="100%" stopColor="#9ca3af" />
      </linearGradient>
      <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </motion.svg>
);

const AssessmentsIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={className}
    viewBox="0 0 200 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Game elements */}
    <motion.rect
      x="60" y="60" width="80" height="50" rx="8"
      fill="url(#tealGradient)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
    />
    <motion.circle
      cx="80" cy="85" r="6"
      fill="white"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.8, type: "spring" }}
    />
    <motion.circle
      cx="100" cy="85" r="6"
      fill="white"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.0, type: "spring" }}
    />
    <motion.circle
      cx="120" cy="85" r="6"
      fill="white"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.2, type: "spring" }}
    />
    
    {/* Play button */}
    <motion.circle
      cx="100" cy="85" r="15"
      stroke="white"
      strokeWidth="2"
      fill="transparent"
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
    />
    <motion.path
      d="M95 80 L105 85 L95 90 Z"
      fill="white"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: "spring" }}
    />
  </motion.svg>
);

const iconMap = {
  candidates: Users,
  leaderboard: Trophy,
  assessments: Target,
  applications: BookOpen,
  achievements: Star,
  analytics: BarChart3,
};

const illustrationMap = {
  candidates: CandidatesIllustration,
  leaderboard: LeaderboardIllustration,
  assessments: AssessmentsIllustration,
  applications: CandidatesIllustration, // Reuse candidates for applications
  achievements: LeaderboardIllustration, // Reuse leaderboard for achievements
  analytics: AssessmentsIllustration, // Reuse assessments for analytics
};

const sizeClasses = {
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const illustrationSizes = {
  sm: 'w-24 h-18',
  md: 'w-32 h-24',
  lg: 'w-40 h-30',
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  action,
  size = 'md'
}) => {
  const Icon = iconMap[type];
  const Illustration = illustrationMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center text-center p-8 ${sizeClasses[size]}`}
    >
      {/* Soft illustration */}
      <div className="relative mb-6">
        <Illustration className={`${illustrationSizes[size]} mx-auto`} />
        
        {/* Floating background elements */}
        <motion.div
          className="absolute -top-2 -right-2 w-4 h-4 bg-game-orange-200 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 w-3 h-3 bg-game-purple-200 rounded-full"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Content */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2"
      >
        <Icon className="w-5 h-5 text-game-teal-500" />
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-gray-600 mb-6 leading-relaxed"
      >
        {description}
      </motion.p>

      {/* Action button */}
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-game-teal-500 to-game-teal-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {action.label}
          </div>
        </motion.button>
      )}
    </motion.div>
  );
};

// Pre-configured empty state components
export const NoCandidatesEmpty: React.FC<{ onAddCandidate?: () => void }> = ({ onAddCandidate }) => (
  <EmptyState
    type="candidates"
    title="No Candidates Yet"
    description="Your hiring platform is ready! Candidates will appear here once they start completing their assessments."
    action={onAddCandidate ? { label: "Invite Candidates", onClick: onAddCandidate } : undefined}
  />
);

export const NoLeaderboardEmpty: React.FC = () => (
  <EmptyState
    type="leaderboard"
    title="Leaderboard Coming Soon"
    description="Complete assessments will unlock the leaderboard. Rankings and top performers will be displayed here."
  />
);

export const NoAssessmentsEmpty: React.FC<{ onStartAssessment?: () => void }> = ({ onStartAssessment }) => (
  <EmptyState
    type="assessments"
    title="Ready to Start?"
    description="Begin your cognitive assessment journey. Complete engaging games that test your skills and showcase your potential."
    action={onStartAssessment ? { label: "Start Assessment", onClick: onStartAssessment } : undefined}
  />
);

export const NoAchievementsEmpty: React.FC = () => (
  <EmptyState
    type="achievements"
    title="Earn Your First Badge"
    description="Complete games and reach milestones to unlock achievements. Your accomplishments will be displayed here."
    size="sm"
  />
);
