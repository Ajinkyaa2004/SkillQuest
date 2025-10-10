import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Mail, Lock, UserCircle, Shield, Sparkles, Eye, EyeOff, CheckCircle2, Rocket, Target, Lightbulb, Flame, Zap, Palette, Star, Trophy, Check, X, AlertCircle } from 'lucide-react';
import { UserRole } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

// Floating particle component
const FloatingParticle: React.FC<{ delay: number; duration: number; x: string; y: string }> = ({ delay, duration, x, y }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      y: [0, -30, -60],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    className="absolute w-1 h-1 bg-[#8558ed] rounded-full"
    style={{ left: x, top: y }}
  />
);

// Floating icon component for playful background
const FloatingIcon: React.FC<{ Icon: React.ElementType; delay: number; x: string; y: string; color: string }> = ({ Icon, delay, x, y, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{
      opacity: [0, 0.4, 0],
      scale: [0, 1.2, 0],
      rotate: [0, 360],
      y: [0, -100],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
  >
    <Icon className={`w-10 h-10 ${color}`} />
  </motion.div>
);

// Password strength calculator
const calculatePasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

  if (strength <= 30) return { strength, label: 'Weak', color: 'bg-red-500' };
  if (strength <= 60) return { strength, label: 'Fair', color: 'bg-orange-500' };
  if (strength <= 80) return { strength, label: 'Good', color: 'bg-yellow-500' };
  return { strength, label: 'Strong', color: 'bg-green-500' };
};

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const SignIn: React.FC = () => {
  const { role } = useParams<{ role: UserRole }>();
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const emailInputRef = React.useRef<HTMLInputElement>(null);
  
  // Form validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '' });
  const [shakeError, setShakeError] = useState(false);

  // Auto-focus email field on mount
  React.useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Real-time email validation
  useEffect(() => {
    if (email.length > 0) {
      setEmailValid(isValidEmail(email));
    } else {
      setEmailValid(false);
    }
  }, [email]);

  // Real-time password strength
  useEffect(() => {
    if (password.length > 0) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength({ strength: 0, label: '', color: '' });
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!role) {
        setError('Invalid role');
        return;
      }

      let success = false;
      if (isSignUp) {
        success = await signup(email, password, role);
        if (!success) {
          setError('Email already exists. Please sign in instead.');
        }
      } else {
        success = await login(email, password, role);
        if (!success) {
          setError('Invalid credentials. Please try again.');
        }
      }

      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'applicant') {
            navigate('/applicant/profile');
          }
        }, 1500);
      } else {
        // Trigger shake animation on error
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'applicant':
        return 'Applicant';
      case 'admin':
        return 'Admin';
      case 'employee':
        return 'Employee';
      case 'client':
        return 'Client';
      default:
        return 'User';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'applicant':
        return UserCircle;
      default:
        return UserCircle;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Floating Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 bg-[#8558ed]/20 rounded-full blur-3xl top-10 -left-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-80 h-80 bg-[#b18aff]/20 rounded-full blur-3xl bottom-10 -right-20"
        />
        
        {/* Animated Particles */}
        <FloatingParticle delay={0} duration={4} x="10%" y="20%" />
        <FloatingParticle delay={0.5} duration={5} x="90%" y="30%" />
        <FloatingParticle delay={1} duration={4.5} x="15%" y="70%" />
        <FloatingParticle delay={1.5} duration={5.5} x="85%" y="60%" />
        <FloatingParticle delay={2} duration={4} x="30%" y="40%" />
        <FloatingParticle delay={2.5} duration={5} x="70%" y="80%" />
        <FloatingParticle delay={3} duration={4.5} x="50%" y="15%" />
        <FloatingParticle delay={3.5} duration={5} x="25%" y="90%" />
        <FloatingParticle delay={4} duration={4} x="75%" y="25%" />
        <FloatingParticle delay={4.5} duration={5.5} x="40%" y="65%" />
        <FloatingParticle delay={5} duration={4.5} x="60%" y="50%" />
        <FloatingParticle delay={5.5} duration={5} x="20%" y="55%" />
        <FloatingParticle delay={6} duration={4} x="80%" y="45%" />
        <FloatingParticle delay={6.5} duration={5} x="35%" y="85%" />
        <FloatingParticle delay={7} duration={4.5} x="65%" y="35%" />
      </div>

      {/* Playful floating icons */}
      <FloatingIcon Icon={Rocket} delay={0} x="5%" y="10%" color="text-[#8558ed]" />
      <FloatingIcon Icon={Sparkles} delay={1} x="15%" y="80%" color="text-[#b18aff]" />
      <FloatingIcon Icon={Target} delay={2} x="85%" y="15%" color="text-[#8558ed]" />
      <FloatingIcon Icon={Lightbulb} delay={3} x="90%" y="70%" color="text-[#b18aff]" />
      <FloatingIcon Icon={Flame} delay={4} x="10%" y="50%" color="text-[#8558ed]" />
      <FloatingIcon Icon={Zap} delay={5} x="80%" y="85%" color="text-[#b18aff]" />
      <FloatingIcon Icon={Palette} delay={6} x="25%" y="25%" color="text-[#8558ed]" />
      <FloatingIcon Icon={Star} delay={7} x="70%" y="40%" color="text-[#b18aff]" />
      <FloatingIcon Icon={Trophy} delay={8} x="50%" y="90%" color="text-[#8558ed]" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          x: shakeError ? [-10, 10, -10, 10, 0] : 0
        }}
        transition={{ 
          duration: shakeError ? 0.5 : 0.8, 
          ease: [0.22, 1, 0.36, 1], 
          delay: shakeError ? 0 : 0.2 
        }}
        className="w-full max-w-md"
      >
        <Card className="border-white/40 bg-white/80 backdrop-blur-xl shadow-2xl shadow-[#8558ed]/10">
          <CardHeader className="space-y-4">
            <motion.div
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2 text-[#8558ed] hover:text-[#b18aff] hover:bg-[#8558ed]/10 transition-all duration-300"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Role Selection
              </Button>
            </motion.div>

            {/* Role Icon Header */}
        {/* Fun Password Field Animation Header */}
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.3 }}
  className="flex justify-center"
>
  <motion.div
    className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#8558ed] to-[#b18aff] flex items-center justify-center shadow-lg"
    whileHover={{ scale: 1.05, rotate: 5 }}
    whileTap={{ scale: 0.95 }}
  >
    <AnimatePresence mode="wait">
      <motion.span
        key={isSignUp ? 'peek' : 'hide'}
        initial={{ opacity: 0, y: 10, rotate: -10 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        exit={{ opacity: 0, y: -10, rotate: 10 }}
        transition={{ duration: 0.3 }}
        className="text-5xl"
      >
        {isSignUp ? '🙉' : '🙈'}
      </motion.span>
    </AnimatePresence>

    {/* Decorative floating sparkles */}
    <motion.div
      className="absolute -top-2 -right-2 text-[#fff]"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
      transition={{ repeat: Infinity, duration: 2, delay: 0.8 }}
    >
      ✨
    </motion.div>
    <motion.div
      className="absolute -bottom-2 -left-2 text-[#fff]"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
      transition={{ repeat: Infinity, duration: 2, delay: 1.2 }}
    >
      💫
    </motion.div>
  </motion.div>
</motion.div>


            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#8558ed] to-[#b18aff] bg-clip-text text-transparent">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isSignUp ? 'signup' : 'signin'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </motion.span>
                </AnimatePresence>
              </CardTitle>
              <CardDescription className="text-base text-[#030303]/70">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isSignUp ? 'signup-desc' : 'signin-desc'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSignUp
                      ? `Sign up as ${getRoleTitle()} to get started`
                      : `Sign in as ${getRoleTitle()} to continue`}
                  </motion.span>
                </AnimatePresence>
              </CardDescription>
            </div>

            <AnimatePresence>
              {role === 'admin' && !isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-[#8558ed]/10 to-[#b18aff]/10 border border-[#8558ed]/20 rounded-lg text-sm text-[#030303]">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#8558ed] mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-[#8558ed]">Demo Admin Credentials:</strong>
                        <div className="mt-1 space-y-0.5 font-mono text-xs">
                          <div>Email: admin@ifa.com</div>
                          <div>Password: admin123</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-[#030303] font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#8558ed]" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    ref={emailInputRef}
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    required
                    className={`border-[#8558ed]/20 focus:border-[#8558ed] focus:ring-[#8558ed]/20 transition-all duration-300 pr-10 ${
                      emailTouched && !emailValid && email.length > 0 ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    } ${
                      emailValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : ''
                    }`}
                  />
                  {/* Email validation indicator */}
                  <AnimatePresence>
                    {email.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {emailValid ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : emailTouched ? (
                          <X className="w-5 h-5 text-red-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Email validation message */}
                <AnimatePresence>
                  {emailTouched && !emailValid && email.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-red-500 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Please enter a valid email address
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#030303] font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#8558ed]" />
                    Password
                  </Label>
                  {!isSignUp && (
                    <motion.button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      whileHover={{ scale: 1.05 }}
                      className="text-xs text-[#8558ed] hover:text-[#b18aff] transition-colors duration-200"
                    >
                      Forgot?
                    </motion.button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-[#8558ed]/20 focus:border-[#8558ed] focus:ring-[#8558ed]/20 transition-all duration-300 pr-10"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8558ed]/60 hover:text-[#8558ed] transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
                
                {/* Password strength meter */}
                <AnimatePresence>
                  {isSignUp && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Password strength:</span>
                        <span className={`text-xs font-semibold ${
                          passwordStrength.label === 'Weak' ? 'text-red-500' :
                          passwordStrength.label === 'Fair' ? 'text-orange-500' :
                          passwordStrength.label === 'Good' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.strength}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full ${passwordStrength.color} transition-colors duration-300`}
                        />
                      </div>
                      <div className="space-y-1">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-xs"
                        >
                          {password.length >= 8 ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" />
                          )}
                          <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                            At least 8 characters
                          </span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 }}
                          className="flex items-center gap-2 text-xs"
                        >
                          {/[A-Z]/.test(password) ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" />
                          )}
                          <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                            One uppercase letter
                          </span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-center gap-2 text-xs"
                        >
                          {/[0-9]/.test(password) ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" />
                          )}
                          <span className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                            One number
                          </span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                          className="flex items-center gap-2 text-xs"
                        >
                          {/[^a-zA-Z0-9]/.test(password) ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" />
                          )}
                          <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                            One special character
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2"
                  >
                    <span className="text-red-500 font-bold">⚠</span>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#8558ed] to-[#b18aff] hover:from-[#7347d6] hover:to-[#a179f0] text-white font-semibold py-6 rounded-lg shadow-lg shadow-[#8558ed]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#8558ed]/40"
                    disabled={loading}
                  >
                    {loading ? (
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Processing...</span>
                      </motion.div>
                    ) : (
                      <span>{isSignUp ? 'Create Account →' : 'Sign In →'}</span>
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="text-center"
              >
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-[#8558ed] hover:text-[#b18aff] font-medium transition-colors duration-300"
                >
                  {isSignUp
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Sign Up"}
                </motion.button>
              </motion.div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-6 text-[#030303]/60 text-sm"
        >
          Secure authentication powered by SkillQuest
        </motion.div>
      </motion.div>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#8558ed]/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-full p-8 shadow-2xl shadow-[#8558ed]/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
              >
                <CheckCircle2 className="w-20 h-20 text-green-500" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForgotPassword(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#8558ed] to-[#b18aff] rounded-full mx-auto"
                >
                  <Lock className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#030303]">Reset Password</h3>
                <p className="text-[#030303]/70">
                  Password reset functionality will be available soon. For now, please contact support or create a new account.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Got it
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
