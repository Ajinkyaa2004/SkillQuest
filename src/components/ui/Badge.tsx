import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Trophy, Zap, Target, Lock, Crown, Medal } from 'lucide-react';

export interface BadgeProps {
  type: 'completed' | 'unlocked' | 'next-up' | 'locked' | 'achievement' | 'level' | 'rank';
  text: string;
  icon?: 'check' | 'star' | 'trophy' | 'zap' | 'target' | 'lock' | 'crown' | 'medal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

const iconMap = {
  check: CheckCircle,
  star: Star,
  trophy: Trophy,
  zap: Zap,
  target: Target,
  lock: Lock,
  crown: Crown,
  medal: Medal,
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
  xl: 'px-6 py-3 text-lg gap-2.5',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

export const Badge: React.FC<BadgeProps> = ({ 
  type, 
  text, 
  icon = 'check', 
  size = 'md', 
  animate = true,
  className = '' 
}) => {
  const IconComponent = iconMap[icon];

  const getTypeClasses = () => {
    switch (type) {
      case 'completed':
        return 'badge-completed text-white';
      case 'unlocked':
        return 'badge-unlocked text-white';
      case 'next-up':
        return 'badge-next text-white';
      case 'locked':
        return 'bg-gray-300 text-gray-600';
      case 'achievement':
        return 'bg-gradient-to-r from-game-purple-500 to-game-purple-400 text-white';
      case 'level':
        return 'bg-gradient-to-r from-game-orange-500 to-game-orange-400 text-white';
      case 'rank':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white';
      default:
        return 'badge-completed text-white';
    }
  };

  const getAnimation = () => {
    if (!animate) return {};

    switch (type) {
      case 'completed':
        return {
          initial: { scale: 0, rotate: 0 },
          animate: { scale: 1, rotate: 360 },
          transition: { 
            type: "spring" as const,
            stiffness: 260,
            damping: 20,
            duration: 0.6
          }
        };
      case 'unlocked':
        return {
          initial: { scale: 0, y: -20 },
          animate: { scale: 1, y: 0 },
          transition: { 
            type: "spring" as const,
            stiffness: 400,
            damping: 15
          }
        };
      case 'next-up':
        return {
          animate: {
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 0 0 rgba(249, 115, 22, 0.7)",
              "0 0 0 10px rgba(249, 115, 22, 0)",
              "0 0 0 0 rgba(249, 115, 22, 0.7)"
            ]
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      default:
        return {
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: { type: "spring" as const, stiffness: 300, damping: 20 }
        };
    }
  };

  return (
    <motion.div
      className={`
        inline-flex items-center font-semibold rounded-full shadow-lg
        ${sizeClasses[size]}
        ${getTypeClasses()}
        ${className}
      `}
      {...getAnimation()}
    >
      <IconComponent className={iconSizes[size]} />
      <span>{text}</span>
    </motion.div>
  );
};

// Pre-configured badge components for common use cases
export const CompletedBadge: React.FC<{ text?: string; size?: BadgeProps['size'] }> = ({ 
  text = "Completed", 
  size = 'md' 
}) => (
  <Badge type="completed" text={text} icon="check" size={size} />
);

export const UnlockedBadge: React.FC<{ text?: string; size?: BadgeProps['size'] }> = ({ 
  text = "Unlocked", 
  size = 'md' 
}) => (
  <Badge type="unlocked" text={text} icon="star" size={size} />
);

export const NextUpBadge: React.FC<{ text?: string; size?: BadgeProps['size'] }> = ({ 
  text = "Next Up!", 
  size = 'md' 
}) => (
  <Badge type="next-up" text={text} icon="target" size={size} />
);

export const LevelBadge: React.FC<{ level: number; size?: BadgeProps['size'] }> = ({ 
  level, 
  size = 'md' 
}) => (
  <Badge type="level" text={`Level ${level}`} icon="zap" size={size} />
);

export const AchievementBadge: React.FC<{ 
  text: string; 
  icon?: BadgeProps['icon'];
  size?: BadgeProps['size'];
}> = ({ 
  text, 
  icon = 'trophy', 
  size = 'md' 
}) => (
  <Badge type="achievement" text={text} icon={icon} size={size} />
);

export const RankBadge: React.FC<{ 
  rank: number; 
  size?: BadgeProps['size'];
}> = ({ 
  rank, 
  size = 'md' 
}) => {
  const getRankText = () => {
    if (rank === 1) return "1st Place";
    if (rank === 2) return "2nd Place";
    if (rank === 3) return "3rd Place";
    return `${rank}th Place`;
  };

  const getRankIcon = (): BadgeProps['icon'] => {
    if (rank <= 3) return 'crown';
    return 'medal';
  };

  return (
    <Badge 
      type="rank" 
      text={getRankText()} 
      icon={getRankIcon()} 
      size={size} 
    />
  );
};

// Badge list component for showing multiple badges
export const BadgeList: React.FC<{ 
  badges: Array<{
    type: BadgeProps['type'];
    text: string;
    icon?: BadgeProps['icon'];
  }>;
  size?: BadgeProps['size'];
  className?: string;
}> = ({ badges, size = 'md', className = '' }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {badges.map((badge, index) => (
      <motion.div
        key={`${badge.type}-${badge.text}-${index}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Badge {...badge} size={size} />
      </motion.div>
    ))}
  </div>
);
