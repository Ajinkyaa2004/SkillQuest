import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileByUserId, getAssessmentByUserId, saveAssessment } from '@/lib/storage';
import { Assessment, GameType } from '@/types';
import { Lock, Play, CheckCircle, Trophy, LogOut, Bomb, Car, Droplet, Sparkles, Target, Zap, Star, Flame, TrendingUp, Rocket, Dumbbell, Flag, Clock } from 'lucide-react';
import { generateCandidateId } from '@/lib/utils';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

// Confetti component
const Confetti: React.FC = () => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDelay: Math.random() * 3,
    backgroundColor: ['#8558ed', '#b18aff', '#7347d6', '#a179f0', '#9b6dff'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: `${piece.left}vw`, rotate: 0, opacity: 1 }}
          animate={{
            y: '100vh',
            rotate: 360,
            opacity: 0,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: piece.animationDelay,
            ease: 'easeIn',
          }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: piece.backgroundColor,
          }}
          className="rounded-full"
        />
      ))}
    </div>
  );
};

// Loading skeleton component
const LoadingSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] p-4"
  >
    <div className="max-w-6xl mx-auto py-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-3">
          <div className="h-10 w-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
      </div>

      {/* Progress bar skeleton */}
      <div className="mb-8 p-6 bg-white/80 rounded-lg border-2 border-gray-200">
        <div className="h-6 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-4 animate-pulse" />
        <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Game cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white/80 rounded-lg border-2 border-gray-200">
            <div className="flex justify-between mb-4">
              <div className="h-16 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

// Animated counter component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(value * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
};

// Floating icon component
const FloatingIcon: React.FC<{ Icon: React.ElementType; delay: number; x: string; y: string; color: string }> = ({ Icon, delay, x, y, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{
      opacity: [0, 0.3, 0],
      scale: [0, 1, 0],
      rotate: [0, 360],
      y: [0, -80],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
  >
    <Icon className={`w-8 h-8 ${color}`} />
  </motion.div>
);

// 3D Tilt Card Component
const TiltCard: React.FC<{ children: React.ReactNode; disabled?: boolean }> = ({ children, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      {children}
    </motion.div>
  );
};

export const AssessmentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate loading delay for smooth skeleton animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
      setIsLoading(false);
    };
    
    loadData();
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
    setIsExiting(true);
    setTimeout(() => {
      navigate(`/applicant/game/${gameType}${isTrial ? '?trial=true' : ''}`);
    }, 500);
  };

  const viewResults = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/applicant/results');
    }, 500);
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
      Icon: Bomb,
      color: 'from-[#8558ed] to-[#b18aff]',
    },
    {
      type: 'unblock-me' as GameType,
      title: 'Unblock Me',
      description: 'Challenge your spatial reasoning and planning',
      skill: 'Spatial Reasoning & Planning',
      Icon: Car,
      color: 'from-[#7347d6] to-[#a179f0]',
    },
    {
      type: 'water-capacity' as GameType,
      title: 'Water Capacity',
      description: 'Solve logical sequencing and optimization puzzles',
      skill: 'Logical Sequencing & Optimization',
      Icon: Droplet,
      color: 'from-[#9b6dff] to-[#c9a9ff]',
    },
  ];

  // Calculate progress
  const completedGames = games.filter(game => isGameCompleted(game.type)).length;
  const progressPercentage = (completedGames / games.length) * 100;

  // Get next game to play
  const getNextGame = (): GameType | null => {
    if (!isGameCompleted('minesweeper')) return 'minesweeper';
    if (!isGameCompleted('unblock-me')) return 'unblock-me';
    if (!isGameCompleted('water-capacity')) return 'water-capacity';
    return null;
  };

  const nextGame = getNextGame();

  // Motivational messages based on progress
  const getMotivationalMessage = () => {
    if (completedGames === 0) return { text: "Let's start your journey!", Icon: Rocket };
    if (completedGames === 1) return { text: "Great start! Keep going!", Icon: Dumbbell };
    if (completedGames === 2) return { text: "Almost there! One more to go!", Icon: Target };
    return { text: "Amazing! You've completed all games!", Icon: Trophy };
  };

  const motivationalMessage = getMotivationalMessage();

  // Calculate estimated time remaining
  const estimatedTimeRemaining = (3 - completedGames) * 5; // 5 minutes per game

  // Show confetti when all games completed
  useEffect(() => {
    if (allGamesCompleted && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [allGamesCompleted]);

  if (isLoading || !assessment || !profile) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] p-4 relative overflow-hidden"
    >
      {/* Floating background icons */}
      <FloatingIcon Icon={Sparkles} delay={0} x="10%" y="15%" color="text-[#8558ed]" />
      <FloatingIcon Icon={Target} delay={1} x="85%" y="20%" color="text-[#b18aff]" />
      <FloatingIcon Icon={Zap} delay={2} x="15%" y="70%" color="text-[#8558ed]" />
      <FloatingIcon Icon={Star} delay={3} x="90%" y="75%" color="text-[#b18aff]" />
      <FloatingIcon Icon={Flame} delay={4} x="50%" y="10%" color="text-[#8558ed]" />
      <FloatingIcon Icon={Trophy} delay={5} x="20%" y="85%" color="text-[#b18aff]" />
      
      {/* Confetti animation */}
      {showConfetti && <Confetti />}
      
      <div className="max-w-6xl mx-auto py-8 relative z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8558ed] via-[#b18aff] to-[#8558ed] bg-clip-text text-transparent">
              Cognitive Assessment
            </h1>
            <motion.p 
              className="text-gray-600 mt-2 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Welcome, <span className="font-semibold">{profile.name}</span> | Candidate ID: <span className="font-mono font-semibold text-[#8558ed]">{profile.candidateId}</span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-[#8558ed] font-semibold mt-1 flex items-center gap-2"
            >
              <motivationalMessage.Icon className="w-4 h-4" />
              {motivationalMessage.text}
            </motion.p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={logout} className="border-2">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        </motion.div>

        {/* Estimated Time Widget */}
        {!allGamesCompleted && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-[#8558ed]/10 to-[#b18aff]/10 border-2 border-[#8558ed]/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8558ed] to-[#b18aff] flex items-center justify-center"
                    >
                      <Clock className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-[#8558ed]">Estimated Time Remaining</p>
                      <p className="text-xs text-gray-600">Complete all games to finish your assessment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#8558ed] to-[#b18aff] bg-clip-text text-transparent">
                      ~{estimatedTimeRemaining}
                    </p>
                    <p className="text-xs text-gray-600">minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Animated Progress Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8558ed]/20">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Assessment Progress</h3>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#8558ed] to-[#b18aff] bg-clip-text text-transparent">
                    {completedGames}/{games.length}
                  </span>
                </div>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#8558ed] via-[#b18aff] to-[#8558ed] rounded-full relative"
                  >
                    <motion.div
                      animate={{
                        x: [0, 100, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  {games.map((game, idx) => (
                    <div key={game.type} className="flex items-center gap-1">
                      {isGameCompleted(game.type) ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </motion.div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                      <span className={isGameCompleted(game.type) ? 'text-green-600 font-semibold' : ''}>
                        {game.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {allGamesCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Card className="mb-6 bg-gradient-to-r from-[#f3f0fc] to-[#faf9fc] border-2 border-[#8558ed]/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#8558ed]">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <CheckCircle className="w-6 h-6 mr-2" />
                    </motion.div>
                    Assessment Complete!
                  </CardTitle>
                  <CardDescription>
                    Congratulations! You have completed all three games. Click below to view your results.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={viewResults} className="bg-gradient-to-r from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0]">
                      <Trophy className="w-4 h-4 mr-2" />
                      View Results
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.4,
              },
            },
          }}
        >
          {games.map((game, index) => {
            const unlocked = isGameUnlocked(game.type);
            const completed = isGameCompleted(game.type);
            const trialUnlocked = isTrialUnlocked(game.type);
            const score = assessment.games[game.type];
            const GameIcon = game.Icon;

            return (
              <motion.div
                key={game.type}
                variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <TiltCard disabled={!unlocked}>
                  <Card className={`${!unlocked ? 'opacity-60' : ''} border-2 border-[#8558ed]/20 hover:shadow-2xl hover:shadow-[#8558ed]/20 transition-all duration-500 bg-white/90 backdrop-blur-xl relative overflow-hidden group ${
                    game.type === nextGame && !completed ? 'ring-2 ring-[#8558ed] ring-offset-2' : ''
                  }`}>
                    {/* Next Up Badge */}
                    {game.type === nextGame && !completed && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
                        className="absolute top-2 right-2 z-20"
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"
                        >
                          <Flag className="w-3 h-3" />
                          Next Up!
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Gradient border glow on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-[#8558ed] to-[#b18aff] rounded-2xl opacity-0 group-hover:opacity-75 blur transition-all duration-700 ease-out" />
                    
                    {/* Pulse effect for next game */}
                    {game.type === nextGame && !completed && (
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute -inset-0.5 bg-gradient-to-br from-[#8558ed] to-[#b18aff] rounded-2xl blur-md"
                      />
                    )}
                    
                    {/* Card content wrapper */}
                    <div className="relative bg-white rounded-2xl">
                    
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`w-16 h-16 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg relative`}
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8558ed] to-[#b18aff] animate-ping opacity-20" />
                          <GameIcon className="w-8 h-8 text-white relative z-10" />
                        </motion.div>
                        {!unlocked && (
                          <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                          >
                            <Lock className="w-6 h-6 text-gray-400" />
                          </motion.div>
                        )}
                        {completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </motion.div>
                        )}
                      </div>
                      <CardTitle className="text-xl mt-3">{game.title}</CardTitle>
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
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="p-3 bg-gradient-to-r from-[#f3f0fc] to-[#faf9fc] rounded-md border border-[#8558ed]/20"
                    >
                      <div className="text-sm font-semibold text-[#8558ed]">
                        Score: <AnimatedCounter value={score.puzzlesCompleted} duration={1.5} /> puzzles completed
                      </div>
                      <div className="text-xs text-[#7347d6]">
                        Time: {Math.floor(score.timeSpent / 60)}:{(score.timeSpent % 60).toString().padStart(2, '0')}
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => startGame(game.type, false)}
                        disabled={!unlocked || completed}
                        className={`w-full ${
                          completed 
                            ? 'bg-[#8558ed]/10 text-[#8558ed] border-[#8558ed]/30' 
                            : !unlocked 
                            ? 'bg-gray-100 text-gray-400 border-gray-300' 
                            : 'bg-gradient-to-r from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white'
                        }`}
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
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                    </motion.div>
                  </div>
                </CardContent>
                    </div>
              </Card>
            </TiltCard>
          </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8558ed]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8558ed]" />
                Assessment Rules
              </CardTitle>
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
        </motion.div>
      </div>
    </motion.div>
  );
};
