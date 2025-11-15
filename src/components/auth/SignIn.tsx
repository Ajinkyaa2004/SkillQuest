import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Rocket,
  Target,
  Lightbulb,
  Flame,
  Zap,
  Palette,
  Star,
  Trophy
} from "lucide-react";
import {UserRole} from "@/types";
import {motion, AnimatePresence} from "framer-motion";
import {GoogleLogin, CredentialResponse} from "@react-oauth/google";
import {toast} from "sonner";

// Floating particle component
const FloatingParticle: React.FC<{
  delay: number;
  duration: number;
  x: string;
  y: string;
}> = ({delay, duration, x, y}) => (
  <motion.div
    initial={{opacity: 0, scale: 0}}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      y: [0, -30, -60]
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
    className="absolute w-1 h-1 bg-game-purple-500 rounded-full"
    style={{left: x, top: y}}
  />
);

// Floating icon component for playful background
const FloatingIcon: React.FC<{
  Icon: React.ElementType;
  delay: number;
  x: string;
  y: string;
  color: string;
}> = ({Icon, delay, x, y, color}) => (
  <motion.div
    initial={{opacity: 0, scale: 0, rotate: 0}}
    animate={{
      opacity: [0, 0.4, 0],
      scale: [0, 1.2, 0],
      rotate: [0, 360],
      y: [0, -100]
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
    className="absolute pointer-events-none"
    style={{left: x, top: y}}
  >
    <Icon className={`w-10 h-10 ${color}`} />
  </motion.div>
);

export const SignIn: React.FC = () => {
  const {role} = useParams<{role: UserRole}>();
  const navigate = useNavigate();
  const {loginWithGoogle} = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGoogleSuccess = async (
  credentialResponse: CredentialResponse
) => {
  if (!credentialResponse.credential) {
    toast.error("Google Sign-In failed. Please try again.", {
      duration: 4000,
      icon: "❌"
    });
    return;
  }

  if (!role) {
    toast.error("Invalid role selected", {
      duration: 4000,
      icon: "⚠️"
    });
    return;
  }

  setLoading(true);

  try {
    // ✅ CRITICAL: Wait for login and get user object
    const loggedInUser = await loginWithGoogle(
      credentialResponse.credential,
      role
    );

    if (loggedInUser) {
      console.log('✅ User logged in successfully:', loggedInUser.id);
      setShowSuccess(true);
      toast.success(`Welcome! Logging you in as ${getRoleTitle()}...`, {
        duration: 2000,
        icon: "🎉"
      });

      // ✅ CRITICAL: Navigate after user is confirmed
      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "applicant") {
          navigate("/applicant/profile");
        } else {
          navigate("/");
        }
      }, 1500);
    } else {
      toast.error(
        role === "admin"
          ? "Unauthorized: Admin access requires a valid admin email."
          : "Authentication failed. Please try again or contact support.",
        {
          duration: 5000,
          icon: "🚫"
        }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    toast.error("An unexpected error occurred. Please try again.", {
      duration: 4000,
      icon: "❌"
    });
  } finally {
    setLoading(false);
  }
};


  const handleGoogleError = () => {
    toast.error(
      "Google Sign-In failed. Please check your connection and try again.",
      {
        duration: 4000,
        icon: "❌"
      }
    );
  };

  const getRoleTitle = () => {
    switch (role) {
      case "applicant":
        return "Applicant";
      case "admin":
        return "Admin";
      case "employee":
        return "Employee";
      case "client":
        return "Client";
      default:
        return "User";
    }
  };

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1]}}
      className="min-h-screen playful-gradient flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Floating Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3]
          }}
          transition={{duration: 8, repeat: Infinity, ease: "easeInOut"}}
          className="absolute w-96 h-96 bg-gradient-to-br from-game-purple-400/30 to-blue-400/20 rounded-full blur-3xl top-10 -left-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute w-80 h-80 bg-gradient-to-br from-orange-400/20 to-game-purple-400/30 rounded-full blur-3xl bottom-10 -right-20"
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
      <FloatingIcon
        Icon={Rocket}
        delay={0}
        x="5%"
        y="10%"
        color="text-orange-500"
      />
      <FloatingIcon
        Icon={Sparkles}
        delay={1}
        x="15%"
        y="80%"
        color="text-game-purple-400"
      />
      <FloatingIcon
        Icon={Target}
        delay={2}
        x="85%"
        y="15%"
        color="text-blue-500"
      />
      <FloatingIcon
        Icon={Lightbulb}
        delay={3}
        x="90%"
        y="70%"
        color="text-game-purple-500"
      />
      <FloatingIcon
        Icon={Flame}
        delay={4}
        x="10%"
        y="50%"
        color="text-orange-400"
      />
      <FloatingIcon
        Icon={Zap}
        delay={5}
        x="80%"
        y="85%"
        color="text-blue-400"
      />
      <FloatingIcon
        Icon={Palette}
        delay={6}
        x="25%"
        y="25%"
        color="text-game-purple-600"
      />
      <FloatingIcon
        Icon={Star}
        delay={7}
        x="70%"
        y="40%"
        color="text-orange-300"
      />
      <FloatingIcon
        Icon={Trophy}
        delay={8}
        x="50%"
        y="90%"
        color="text-blue-600"
      />

      <motion.div
        initial={{y: 20, opacity: 0}}
        animate={{
          y: [0, -2, 0],
          opacity: 1
        }}
        transition={{
          y: {duration: 4, repeat: Infinity, ease: "easeInOut"},
          opacity: {duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2}
        }}
        className="w-full max-w-md"
      >
        <Card className="relative border-0 bg-white/95 backdrop-blur-xl shadow-2xl shadow-game-purple-500/20 overflow-hidden">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-game-purple-500/20 via-blue-500/20 to-orange-500/20 rounded-xl blur-sm -z-10"></div>
          <div className="absolute inset-[1px] bg-white/95 backdrop-blur-xl rounded-xl"></div>

          <div className="relative">
            <CardHeader className="space-y-4">
              <motion.div
                whileHover={{x: -4}}
                whileTap={{scale: 0.95}}
                transition={{type: "spring", stiffness: 400, damping: 17}}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit -ml-2 text-game-purple-600 hover:text-game-purple-500 hover:bg-game-purple-500/10 transition-all duration-300"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Role Selection
                </Button>
              </motion.div>

              {/* Google Icon Header */}
              <motion.div
                initial={{scale: 0}}
                animate={{scale: 1}}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 18,
                  delay: 0.3
                }}
                className="flex justify-center"
              >
                <motion.div
                  className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-game-purple-700 to-game-purple-400 flex items-center justify-center shadow-lg"
                  whileHover={{scale: 1.05, rotate: 5}}
                  whileTap={{scale: 0.95}}
                >
                  <motion.span
                    initial={{opacity: 0, scale: 0}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.5, delay: 0.5}}
                    className="text-5xl"
                  >
                    🔐
                  </motion.span>

                  {/* Decorative floating sparkles */}
                  <motion.div
                    className="absolute -top-2 -right-2 text-[#fff]"
                    initial={{opacity: 0, scale: 0}}
                    animate={{opacity: [0, 1, 0], scale: [0, 1.2, 0]}}
                    transition={{repeat: Infinity, duration: 2, delay: 0.8}}
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-2 -left-2 text-[#fff]"
                    initial={{opacity: 0, scale: 0}}
                    animate={{opacity: [0, 1, 0], scale: [0, 1.2, 0]}}
                    transition={{repeat: Infinity, duration: 2, delay: 1.2}}
                  >
                    💫
                  </motion.div>
                </motion.div>
              </motion.div>

              <div className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-game-purple-700 to-game-purple-400 bg-clip-text text-transparent">
                  Sign In with Google
                </CardTitle>
                <CardDescription className="text-base text-[#030303]/70">
                  Sign in as <strong>{getRoleTitle()}</strong> to continue to
                  SkillQuest
                </CardDescription>
              </div>

              {/* Admin Notice */}
              <AnimatePresence>
                {role === "admin" && (
                  <motion.div
                    initial={{opacity: 0, height: 0, y: -10}}
                    animate={{opacity: 1, height: "auto", y: 0}}
                    exit={{opacity: 0, height: 0, y: -10}}
                    transition={{duration: 0.4, ease: [0.22, 1, 0.36, 1]}}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-game-purple-500/10 to-game-purple-400/10 border border-game-purple-500/20 rounded-lg text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-game-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-game-purple-700">
                            Admin Access:
                          </strong>
                          <p className="mt-1 text-xs">
                            Only authorized admin email addresses (e.g.,
                            admin@ifa.com) can access the admin dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardHeader>

            <CardContent className="pb-8">
              <div className="space-y-6">
                {/* Google Sign-In Button */}
                <motion.div
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.5, delay: 0.6}}
                  className="flex justify-center"
                >
                  <div className="w-full max-w-xs">
                    {loading ? (
                      <div className="flex items-center justify-center py-3 bg-gray-100 rounded-lg">
                        <motion.div
                          animate={{rotate: 360}}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear"
                          }}
                          className="w-5 h-5 border-2 border-game-purple-500 border-t-transparent rounded-full"
                        />
                        <span className="ml-3 text-gray-600 font-medium">
                          Processing...
                        </span>
                      </div>
                    ) : (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_blue"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                        logo_alignment="left"
                      />
                    )}
                  </div>
                </motion.div>

                {/* Info Section */}
                <motion.div
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{duration: 0.5, delay: 0.8}}
                  className="text-center space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <div className="h-px flex-1 bg-gray-300"></div>
                    <span>Secure OAuth 2.0</span>
                    <div className="h-px flex-1 bg-gray-300"></div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed px-4">
                    By signing in, you agree to SkillQuest's Terms of Service
                    and Privacy Policy. Your data is protected with
                    industry-standard encryption.
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.8, delay: 1}}
          className="text-center mt-6 space-y-3"
        >
          <div className="text-gray-600 text-sm">
            🔒 Secure Google OAuth 2.0 Authentication
          </div>
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="text-gray-500">Powered by IFA SkillQuest</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">Support Available 24/7</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-game-purple-500/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{scale: 0, rotate: -180}}
              animate={{scale: 1, rotate: 0}}
              transition={{type: "spring", stiffness: 200, damping: 20}}
              className="bg-white rounded-full p-8 shadow-2xl shadow-game-purple-500/30"
            >
              <motion.div
                initial={{scale: 0}}
                animate={{scale: 1}}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                }}
              >
                <CheckCircle2 className="w-20 h-20 text-green-500" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
