import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileByUserId, getAssessmentByUserId, saveAssessment } from '@/lib/storage';
import { Assessment, GameType } from '@/types';
import { Trophy, CheckCircle, Clock, LogOut, Sparkles, Zap, Star, Target, Flame, Flag, XCircle, Play, Lock, Bomb, Car, Droplet, Rocket, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Confetti component
const Confetti: React.FC = () => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDelay: Math.random() * 3,
    backgroundColor: ['rgb(168, 85, 247)', 'rgb(249, 115, 22)', 'rgb(20, 184, 166)', 'rgb(34, 197, 94)', 'rgb(249, 115, 22)', 'rgb(20, 184, 166)'][Math.floor(Math.random() * 6)],
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

// Subtle Hover Card Component
const SubtleHoverCard: React.FC<{ children: React.ReactNode; disabled?: boolean }> = ({ children, disabled }) => {
  return (
    <motion.div
      whileHover={!disabled ? { y: -2, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.15 }}
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
  const [showRetryInfo, setShowRetryInfo] = useState<{[key: string]: boolean}>({});

  // ✅ UPDATED: Now async with MongoDB
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        
        // Simulate loading delay for smooth skeleton animation
        await new Promise(resolve => setTimeout(resolve, 800));

        // ✅ Fetch profile from MongoDB (now async)
        const userProfile = await getProfileByUserId(user.id);
        
        if (!userProfile || !userProfile.profileCompleted) {
          navigate('/applicant/profile');
          return;
        }
        setProfile(userProfile);

        // ✅ Fetch assessment from MongoDB (now async)
        let userAssessment = await getAssessmentByUserId(user.id);
        
        if (!userAssessment) {
          // Create new assessment if doesn't exist
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
          // ✅ Save to MongoDB (now async)
          await saveAssessment(userAssessment);
          toast.info('New assessment initialized', {
            duration: 2000,
            icon: '📝',
          });
        }
        
        setAssessment(userAssessment);
      } catch (error) {
        console.error('Error loading assessment data:', error);
        toast.error('Failed to load assessment data. Please try again.', {
          duration: 4000,
          icon: '❌',
        });
      } finally {
        setIsLoading(false);
      }
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

  const hasFailedGame = assessment?.games.minesweeper?.failed ||
    assessment?.games['unblock-me']?.failed ||
    assessment?.games['water-capacity']?.failed;

  const games = [
    {
      type: 'minesweeper' as GameType,
      title: 'Minesweeper',
      description: 'Test your risk assessment and deductive logic',
      skill: 'Risk Assessment & Deductive Logic',
      Icon: Bomb,
      color: 'from-game-purple-700 to-game-purple-500',
      available: true,
    },
    {
      type: 'water-capacity' as GameType,
      title: 'Water Capacity',
      description: 'Solve logical sequencing and optimization puzzles',
      skill: 'Logical Sequencing & Optimization',
      Icon: Droplet,
      color: 'from-game-teal-500 to-game-teal-400',
      available: true,
    },
    {
      type: 'unblock-me' as GameType,
      title: 'Unblock Me',
      description: 'Challenge your spatial reasoning and planning',
      skill: 'Spatial Reasoning & Planning',
      Icon: Car,
      color: 'from-orange-500 to-orange-400',
      available: false,
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
    if (hasFailedGame) return { text: "Review your performance and try again!", Icon: Target };
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
  }, [allGamesCompleted, showConfetti]);

  if (isLoading || !assessment || !profile) {
    return <LoadingSkeleton />;
  }
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen playful-gradient p-4 relative overflow-hidden"
    >
      {/* Floating Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 bg-gradient-to-br from-game-teal-400/30 to-green-400/20 rounded-full blur-3xl top-10 -left-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-80 h-80 bg-gradient-to-br from-orange-400/25 to-game-teal-400/25 rounded-full blur-3xl bottom-10 -right-20"
        />
      </div>
      
      {/* Floating background icons */}
      <FloatingIcon Icon={Sparkles} delay={0} x="10%" y="15%" color="text-game-teal-500" />
      <FloatingIcon Icon={Target} delay={1} x="85%" y="20%" color="text-orange-500" />
      <FloatingIcon Icon={Zap} delay={2} x="15%" y="70%" color="text-game-purple-500" />
      <FloatingIcon Icon={Star} delay={3} x="90%" y="75%" color="text-game-teal-400" />
      <FloatingIcon Icon={Flame} delay={4} x="50%" y="10%" color="text-orange-400" />
      <FloatingIcon Icon={Trophy} delay={5} x="20%" y="85%" color="text-green-500" />
      
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-game-purple-700 via-game-purple-500 to-game-purple-400 bg-clip-text text-transparent drop-shadow-lg">
              IFA SkillQuest Assessment
            </h1>
            <motion.p 
              className="text-gray-600 mt-2 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Welcome, <span className="font-semibold">{profile.name}</span> | Candidate ID: <span className="font-mono font-semibold text-game-purple-600">{profile.candidateId}</span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-orange-600 font-semibold mt-1 flex items-center gap-2"
            >
              <motivationalMessage.Icon className="w-4 h-4" />
              {motivationalMessage.text}
            </motion.p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={logout} className="border-2 border-game-purple-500/30 text-game-purple-700 hover:bg-game-purple-50">
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
            <Card className="bg-gradient-to-r from-game-purple-500/10 to-game-purple-400/10 border-2 border-game-purple-500/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-game-purple-700 to-game-purple-400 flex items-center justify-center"
                    >
                      <Clock className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-game-purple-700">Estimated Time Remaining</p>
                      <p className="text-xs text-gray-600">Complete all games to finish your assessment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-game-purple-700 to-game-purple-400 bg-clip-text text-transparent">
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
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-game-purple-500/20 shadow-lg shadow-game-purple-500/10">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Assessment Progress</h3>
                  <span className="text-2xl font-bold bg-gradient-to-r from-game-purple-700 to-game-purple-400 bg-clip-text text-transparent">
                    {completedGames}/{games.length}
                  </span>
                </div>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-game-purple-700 via-game-purple-500 to-game-purple-400 rounded-full relative"
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
                  {games.map((game) => {
                    const gameScore = assessment.games[game.type];
                    const isCompleted = isGameCompleted(game.type);
                    const isFailed = gameScore?.failed;
                    
                    return (
                      <div key={game.type} className="flex items-center gap-1">
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500 }}
                          >
                            {isFailed ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </motion.div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className={
                          isFailed ? 'text-red-600 font-semibold' :
                          isCompleted ? 'text-green-600 font-semibold' : ''
                        }>
                          {game.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {allGamesCompleted && !hasFailedGame && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.6 }}
            >
              <Card className="mb-6 bg-gradient-to-r from-game-teal-500/5 via-green-500/5 to-orange-500/5 border-2 border-game-teal-500/30 shadow-lg shadow-game-teal-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-game-teal-700">
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
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button onClick={viewResults} className="bg-game-purple-600 hover:bg-game-purple-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-game-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-game-purple-500/40">
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
          {games.map((game) => {
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
                <SubtleHoverCard disabled={!unlocked || !game.available}>
                  <Card className={`${!unlocked || !game.available ? 'opacity-60' : ''} border-2 border-game-purple-500/20 hover:shadow-lg hover:shadow-game-purple-500/10 transition-all duration-300 bg-white/90 backdrop-blur-xl relative overflow-hidden group ${
                    game.type === nextGame && !completed ? 'ring-2 ring-game-purple-500 ring-offset-2' : ''
                  }`}>
                    {/* Coming Soon Ribbon */}
                    {!game.available && (
                      <motion.div
                        className="absolute top-3 right-3 z-30"
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: 12 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <motion.div
                          className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white text-sm font-extrabold px-4 py-2 rounded-full shadow-2xl border-2 border-white"
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          Coming Soon
                        </motion.div>
                      </motion.div>
                    )}
                    
                    {/* Next Up Badge */}
                    {game.type === nextGame && !completed && game.available && (
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
                          className="bg-gradient-to-r from-game-purple-700 to-game-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"
                        >
                          <Flag className="w-3 h-3" />
                          Next Up!
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Gradient border glow on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-game-purple-700 to-game-purple-400 rounded-2xl opacity-0 group-hover:opacity-75 blur transition-all duration-700 ease-out" />
                    
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
                        className="absolute -inset-0.5 bg-gradient-to-br from-game-purple-700 to-game-purple-500 rounded-2xl blur-md"
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
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-game-purple-700 to-game-purple-400 animate-ping opacity-20" />
                          <GameIcon className="w-8 h-8 text-white relative z-10" />
                        </motion.div>
                        {!unlocked && game.available && (
                          <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                          >
                            <Lock className="w-6 h-6 text-gray-400" />
                          </motion.div>
                        )}
                        {completed && score?.failed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            <XCircle className="w-6 h-6 text-red-600" />
                          </motion.div>
                        )}
                        {completed && !score?.failed && (
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
                      className={`p-3 rounded-md border ${
                        score.failed 
                          ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300'
                          : 'bg-gradient-to-r from-game-purple-500/5 to-game-purple-400/5 border-game-purple-500/20'
                      }`}
                    >
                      {score.failed ? (
                        <>
                          <div className="text-sm font-bold text-red-600 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Failed
                          </div>
                          {score.failureReason && (
                            <div className="text-xs text-red-700 mt-1">
                              {score.failureReason}
                            </div>
                          )}
                          <div className="mt-2">
                            <button
                              onClick={() => setShowRetryInfo(prev => ({ ...prev, [game.type]: !prev[game.type] }))}
                              className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                              Click here to know more
                            </button>
                            {showRetryInfo[game.type] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800"
                              >
                                You can replay this game in the next <strong>7 days</strong>. 
                                Until then, this game will be unavailable for you to attempt again.
                              </motion.div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-semibold text-game-purple-700">
                            Score: <AnimatedCounter value={score.puzzlesCompleted} duration={1.5} /> puzzles completed
                          </div>
                          <div className="text-xs text-game-purple-600">
                            Time: {Math.floor(score.timeSpent / 60)}:{(score.timeSpent % 60).toString().padStart(2, '0')}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => startGame(game.type, false)}
                        disabled={!unlocked || completed || !game.available}
                        className={`w-full ${
                          completed 
                            ? 'bg-game-purple-500/10 text-game-purple-700 border-game-purple-500/30' 
                            : !unlocked || !game.available
                            ? 'bg-gray-100 text-gray-400 border-gray-300' 
                            : 'bg-gradient-to-r from-game-purple-700 via-game-purple-600 to-game-purple-500 hover:from-game-purple-800 hover:via-game-purple-700 hover:to-game-purple-600 text-white font-bold rounded-xl shadow-lg shadow-game-purple-500/30 hover:shadow-xl hover:shadow-game-purple-500/40'
                        }`}
                      >
                      {!game.available ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Coming Soon
                        </>
                      ) : completed ? (
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
                        disabled={!trialUnlocked || !game.available}
                        variant="outline"
                        className="w-full"
                      >
                      {!game.available ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Coming Soon
                        </>
                      ) : !trialUnlocked ? (
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
            </SubtleHoverCard>
          </motion.div>
            );
          })}
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-game-purple-500/20 shadow-lg shadow-game-purple-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-game-purple-600" />
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
