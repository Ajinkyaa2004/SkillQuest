import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ProgressBarProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  showPercentages?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

interface CircularProgressProps {
  percentage: number;
  title: string;
  subtitle?: string;
  color?: 'teal' | 'orange' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  title: string;
  color?: 'teal' | 'orange' | 'purple';
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: number; trend: 'up' | 'down' };
  icon?: React.ElementType;
  color?: 'teal' | 'orange' | 'purple';
}

const heightClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

const colorMap = {
  teal: {
    primary: 'bg-game-teal-500',
    secondary: 'bg-game-teal-200',
    gradient: 'from-game-teal-400 to-game-teal-600',
    text: 'text-game-teal-600'
  },
  orange: {
    primary: 'bg-game-orange-500',
    secondary: 'bg-game-orange-200',
    gradient: 'from-game-orange-400 to-game-orange-600',
    text: 'text-game-orange-600'
  },
  purple: {
    primary: 'bg-game-purple-500',
    secondary: 'bg-game-purple-200',
    gradient: 'from-game-purple-400 to-game-purple-600',
    text: 'text-game-purple-600'
  }
};

// Animated Progress Bar Chart
export const ProgressBarChart: React.FC<ProgressBarProps> = ({ 
  data, 
  title, 
  subtitle, 
  showPercentages = true,
  height = 'md'
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          const colors = ['teal', 'orange', 'purple'] as const;
          const colorScheme = colorMap[colors[index % 3]];
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{item.value}</span>
                  {showPercentages && (
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  )}
                </div>
              </div>
              <div className={`w-full ${colorScheme.secondary} rounded-full ${heightClasses[height]}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  className={`${colorScheme.primary} ${heightClasses[height]} rounded-full relative overflow-hidden`}
                >
                  <motion.div
                    animate={{ x: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Circular Progress Chart
export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  title,
  subtitle,
  color = 'teal',
  size = 'md'
}) => {
  const sizeMap = {
    sm: { container: 'w-24 h-24', stroke: '4', text: 'text-lg' },
    md: { container: 'w-32 h-32', stroke: '6', text: 'text-xl' },
    lg: { container: 'w-40 h-40', stroke: '8', text: 'text-2xl' }
  };
  
  const { container, stroke, text } = sizeMap[size];
  const colorScheme = colorMap[color];
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col items-center">
      <div className="relative mb-4">
        <svg className={`${container} transform -rotate-90`} viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#gradient)"
            strokeWidth={stroke}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={`stop-${color === 'teal' ? 'game-teal' : color === 'orange' ? 'game-orange' : 'game-purple'}-400`} />
              <stop offset="100%" className={`stop-${color === 'teal' ? 'game-teal' : color === 'orange' ? 'game-orange' : 'game-purple'}-600`} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 300 }}
            className={`${text} font-bold ${colorScheme.text}`}
          >
            {percentage}%
          </motion.span>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="font-bold text-gray-800">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

// Simple Line Chart
export const SimpleLineChart: React.FC<LineChartProps> = ({
  data,
  title,
  color = 'teal'
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colorScheme = colorMap[color];
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 280;
    const y = 120 - (item.value / maxValue) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      
      <div className="relative">
        <svg width="300" height="140" className="overflow-visible">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={40 + i * 20}
              x2="280"
              y2={40 + i * 20}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Line */}
          <motion.polyline
            points={points}
            fill="none"
            stroke={`url(#lineGradient-${color})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 280;
            const y = 120 - (item.value / maxValue) * 80;
            
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                className={colorScheme.primary}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 1, type: "spring" }}
              />
            );
          })}
          
          <defs>
            <linearGradient id={`lineGradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`stop-${color === 'teal' ? 'game-teal' : color === 'orange' ? 'game-orange' : 'game-purple'}-400`} />
              <stop offset="100%" className={`stop-${color === 'teal' ? 'game-teal' : color === 'orange' ? 'game-orange' : 'game-purple'}-600`} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-2">
          {data.map((item, index) => (
            <span key={index} className="text-xs text-gray-600 font-medium">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Animated Stat Card
export const AnimatedStatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon = Users,
  color = 'teal'
}) => {
  const colorScheme = colorMap[color];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorScheme.gradient} opacity-10 rounded-full -mr-12 -mt-12`} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {change && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              change.trend === 'up' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {change.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(change.value)}%
            </div>
          )}
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          <div className={`text-3xl font-bold ${colorScheme.text} mb-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-600 font-medium">{title}</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Pre-configured chart components for common use cases
export const AssessmentCompletionChart: React.FC<{ completed: number; total: number }> = ({
  completed,
  total
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <CircularProgress
      percentage={Math.round(percentage)}
      title="Assessment Completion"
      subtitle={`${completed} of ${total} completed`}
      color="teal"
    />
  );
};

export const GamePerformanceChart: React.FC<{
  minesweeper: number;
  unblockMe: number;
  waterCapacity: number;
}> = ({ minesweeper, unblockMe, waterCapacity }) => {
  const data = [
    { label: 'Minesweeper', value: minesweeper },
    { label: 'Unblock Me', value: unblockMe },
    { label: 'Water Capacity', value: waterCapacity }
  ];
  
  return (
    <ProgressBarChart
      data={data}
      title="Game Performance"
      subtitle="Average scores across all games"
    />
  );
};

export const DailyEngagementChart: React.FC<{
  data: Array<{ day: string; users: number }>;
}> = ({ data }) => {
  return (
    <SimpleLineChart
      data={data.map(d => ({ label: d.day, value: d.users }))}
      title="Daily User Engagement"
      color="purple"
    />
  );
};
