import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Shield, Briefcase, Users, Sparkles } from 'lucide-react';
import { UserRole } from '@/types';
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Rocket, ArrowDown, Zap } from 'lucide-react';



const roles = [
  {
    type: 'applicant' as UserRole,
    title: 'Applicant',
    description: 'Apply for positions and complete assessments',
    icon: UserCircle,
    available: true,
    badge: 'Popular',
    badgeColor: 'from-[green] to-[lightgreen]',
  },
  {
    type: 'admin' as UserRole,
    title: 'Admin',
    description: 'Manage candidates and view analytics',
    icon: Shield,
    available: true,
    badge: 'MVP',
    badgeColor: 'from-[green] to-[lightgreen]',
  },
  {
    type: 'employee' as UserRole,
    title: 'Employee',
    description: 'Access internal resources and tools',
    icon: Briefcase,
    available: false,
    badge: 'Soon',
    badgeColor: 'from-[orange] to-[red]',
  },
  {
    type: 'client' as UserRole,
    title: 'Client',
    description: 'Review candidate profiles and reports',
    icon: Users,
    available: false,
    badge: 'Soon',
    badgeColor: 'from-[orange] to-[red]',
  },
];

// Sparkle component for header animation
const Sparkle: React.FC<{ delay: number; x: string; y: string }> = ({ delay, x, y }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
      ease: [0.4, 0, 0.2, 1],
      repeatDelay: 0.5,
    }}
    className="absolute"
    style={{ left: x, top: y }}
  >
    <Sparkles className="w-20 h-10 text-[#8558ed]/40" />
  </motion.div>
);

// Tilt card component with parallax
const TiltCard: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  available: boolean;
}> = ({ children, onClick, available }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.5 }}
      className="relative"
    >
      {children}
    </motion.div>
  );
};

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: UserRole, available: boolean) => {
    if (!available) {
      alert('This role is not available in the MVP version.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      navigate(`/auth/${role}`);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-gradient-to-br from-[#f3f0fc] flex items-center justify-center p-6 relative overflow-hidden"
    >

      {/* Floating Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute w-72 h-72 bg-[#8558ed]/30 rounded-full blur-3xl top-10 left-20 animate-pulse"></div>
        <div className="absolute w-60 h-60 bg-[#b18aff]/20 rounded-full blur-3xl bottom-10 right-20 animate-bounce"></div>
        <div className="absolute w-96 h-96 bg-[#f3f0fc]/10 rounded-full blur-3xl top-1/2 left-1/3 animate-spin-slow"></div>
      </div>

      <div className="w-full max-w-6xl">

        {/* Header */}
        <div className="text-center mb-16 -mt-8 relative">
          {/* Sparkles around header */}
          <Sparkle delay={0} x="20%" y="10%" />
          <Sparkle delay={0.5} x="80%" y="15%" />
          <Sparkle delay={1} x="15%" y="80%" />
          <Sparkle delay={1.5} x="85%" y="75%" />
          <Sparkle delay={2} x="50%" y="5%" />
          <Sparkle delay={2.5} x="45%" y="90%" />

          <h1
            className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8558ed] via-[#b18aff] to-[#8558ed] 
             animate-gradient-x drop-shadow-[0_0_25px_rgba(133,88,237,0.3)] tracking-tight select-none"
          >
            SkillQuest
          </h1>

          <p className="text-lg font-medium text-[#8558ed]/90 mt-2 flex items-center justify-center gap-2">
  Choose your journey and let SkillQuest guide you <Rocket className="w-5 h-5 text-[#8558ed]" />
</p>


<p className="text-lg text-[#030303]/80 mt-2 flex items-center justify-center gap-2">
  Select your role to continue <ArrowDown className="w-5 h-5 text-[#030303]/70" />
</p>

        </div>

        {/* Role Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
          }}
        >
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.type}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard
                  onClick={() => handleRoleSelect(role.type, role.available)}
                  available={role.available}
                >
                  <div className="relative group">
                    {/* Gradient border glow */}
                    <div className={`absolute -inset-0.5  rounded-2xl opacity-0 group-hover:opacity-75 blur transition-all duration-700 ease-out animate-gradient-xy`}></div>

                    {/* Coming Soon Ribbon */}
                    {!role.available && (
                      <motion.div
                        className="absolute -top-2 -right-2 z-10"
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: 12 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <motion.div
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          Coming Soon
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Card content */}
                    <motion.div
                      whileHover={{ scale: 1.03, y: -8 }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative cursor-pointer rounded-2xl border border-white/25 bg-white/15 backdrop-blur-xl p-6 shadow-lg shadow-[#8558ed]/20 transition-all duration-500 ease-out  ${!role.available ? 'opacity-60' : ''}`}
                      onClick={() => handleRoleSelect(role.type, role.available)}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        {/* Icon */}
                        <motion.div
                          style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}
                          className="bg-gradient-to-tr from-[#8558ed] to-[#b18aff] w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative"
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8558ed] to-[#b18aff] animate-ping opacity-20"></div>
                          <Icon className="w-8 h-8 text-[#f3f0fc] relative z-10" />
                        </motion.div>

                        {/* Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${role.badgeColor} shadow-md`}>
                          {role.badge}
                        </div>

                        <h2 className="text-xl font-semibold text-[#030303]">{role.title}</h2>
                        <p className="text-sm text-[#030303]/70">{role.description}</p>
                        <motion.button
                          disabled={!role.available}
                          whileHover={
                            role.available
                              ? {
                                scale: 1.06,
                                y: -2,
                                boxShadow: "0px 12px 25px rgba(133,88,237,0.3)",
                                transition: { type: "spring", stiffness: 200, damping: 20 },
                              }
                              : {}
                          }
                          whileTap={
                            role.available
                              ? {
                                scale: 0.97,
                                y: 0,
                                boxShadow: "0px 6px 12px rgba(133,88,237,0.2)",
                                transition: { type: "spring", stiffness: 300, damping: 25 },
                              }
                              : {}
                          }
                          initial={{ opacity: 1 }}
                          animate={
                            role.available
                              ? {
                                backgroundColor: ["#8558ed", "#b18aff", "#8558ed"],
                                transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                              }
                              : {}
                          }
                          className={`mt-4 w-full rounded-lg py-2 font-medium text-[#f3f0fc] ${role.available
                              ? "bg-[#8558ed] hover:bg-[#b18aff]"
                              : "border border-[#b18aff] text-[#b18aff] cursor-not-allowed bg-transparent"
                            }`}
                        >
                          {role.available ? "Continue →" : "Coming Soon"}
                        </motion.button>

                      </div>
                    </motion.div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-20 text-[#030303]/70 text-sm flex items-center justify-center space-x-2">
  <motion.div
  
    initial={{ y: 0 }}
    animate={{ y: [0, -3, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <Zap className="w-5 h-5 text-[#8558ed]" />
  </motion.div>
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.5 }}
    className="font-medium"
  >
    Hack. Build. Conquer. – Together
  </motion.p>
</div>

      </div>

      {/* Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center bg-[#f3f0fc]/80 backdrop-blur-md z-50"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#8558ed] border-t-transparent rounded-full"
          ></motion.div>
          <motion.p
            className="ml-4 text-[#8558ed] font-semibold text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Loading...
          </motion.p>
        </motion.div>
      )}

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 5s ease infinite; }

        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }
        .animate-gradient-xy { background-size: 400% 400%; animation: gradient-xy 8s ease infinite; }

        @keyframes spin-slow {
          0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
    </motion.div>
  );
};
