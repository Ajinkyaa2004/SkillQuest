import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getProfiles, getAssessments, getLeaderboard } from '@/lib/storage';
import { ApplicantProfile, Assessment, LeaderboardEntry } from '@/types';
import { Users, Trophy, CheckCircle, Clock, LogOut, Search, Download, Star, Target, TrendingUp, Award, Mail, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCards } from './StatCards';
import { DashboardCharts } from './DashboardCharts';
import { CandidateInsights } from './CandidateInsights';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ApplicantProfile[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'leaderboard' | 'insights'>('overview');
  const [sortBy, setSortBy] = useState<'total' | 'minesweeper' | 'unblockMe' | 'waterCapacity'>('total');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showMessageOptions, setShowMessageOptions] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = () => {
    setProfiles(getProfiles());
    setAssessments(getAssessments());
    setLeaderboard(getLeaderboard());
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeaderboard = leaderboard
    .filter(entry =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'minesweeper':
          return b.gameScores.minesweeper - a.gameScores.minesweeper;
        case 'unblockMe':
          return b.gameScores.unblockMe - a.gameScores.unblockMe;
        case 'waterCapacity':
          return b.gameScores.waterCapacity - a.gameScores.waterCapacity;
        case 'total':
        default:
          return b.totalScore - a.totalScore;
      }
    });


  const exportData = () => {
    const data = activeTab === 'leaderboard' ? filteredLeaderboard : filteredProfiles;
    const csv = convertToCSV(data);
    downloadCSV(csv, `${activeTab}-data-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleMessageClick = (userId: string) => {
    if (selectedUser === userId && showMessageOptions) {
      setShowMessageOptions(false);
      setSelectedUser(null);
    } else {
      setSelectedUser(userId);
      setShowMessageOptions(true);
    }
  };

  const handleGmailClick = (profile: ApplicantProfile) => {
    const subject = encodeURIComponent('Regarding Your Application at IFA SkillQuest');
    const body = encodeURIComponent(`Dear ${profile.name},\n\nThank you for your application to IFA SkillQuest.\n\nBest regards,\nIFA Team`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}&su=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsAppClick = (profile: ApplicantProfile) => {
    const message = encodeURIComponent(`Hi ${profile.name}, thank you for your application to IFA SkillQuest. We will get back to you soon!`);
    const phoneNumber = profile.phone.replace(/\D/g, ''); // Remove non-digits
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen playful-gradient relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 bg-gradient-to-br from-game-teal-400/20 to-game-orange-400/20 rounded-full blur-3xl top-10 -left-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-80 h-80 bg-gradient-to-br from-game-purple-400/20 to-game-teal-400/20 rounded-full blur-3xl bottom-10 -right-20"
        />
      </div>

      {/* Floating Icons */}

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-xl border-b-2 border-game-teal-500/20 shadow-lg shadow-game-teal-500/10 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-game-teal-700 flex items-center gap-2">
              <Target className="w-8 h-8 text-game-teal-500" />
              Admin Dashboard
            </h1>
            <p className="text-sm text-game-teal-600/70 font-medium mt-1 flex items-center gap-2">
              <Star className="w-4 h-4" />
               IFA SkillQuest
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={logout}
              className="border-2 border-game-teal-500/30 hover:bg-game-teal-500/10 font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Dashboard Overview */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Stat Cards */}
            <StatCards profiles={profiles} assessments={assessments} />
            
            {/* Navigation Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setActiveTab('candidates')}
                  className="w-full h-28 text-lg font-bold bg-gradient-to-r from-game-teal-500 to-game-teal-400 hover:from-game-teal-600 hover:to-game-teal-500 text-white shadow-lg shadow-game-teal-500/30"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-8 h-8" />
                    <span>View All Candidates</span>
                  </div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setActiveTab('insights')}
                  className="w-full h-28 text-lg font-bold bg-gradient-to-r from-game-purple-500 to-game-purple-400 hover:from-game-purple-600 hover:to-game-purple-500 text-white shadow-lg shadow-game-purple-500/30"
                >
                  <div className="flex flex-col items-center gap-2">
                    <TrendingUp className="w-8 h-8" />
                    <span>View Candidate Insights</span>
                  </div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setActiveTab('leaderboard')}
                  className="w-full h-28 text-lg font-bold bg-gradient-to-r from-game-orange-500 to-game-orange-400 hover:from-game-orange-600 hover:to-game-orange-500 text-white shadow-lg shadow-game-orange-500/30"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Trophy className="w-8 h-8" />
                    <span>View Leaderboard</span>
                  </div>
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Dashboard Charts */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <DashboardCharts profiles={profiles} assessments={assessments} />
            </motion.div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        {activeTab !== 'overview' && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 mb-6"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={activeTab === 'candidates' ? 'default' : 'outline'}
                onClick={() => setActiveTab('candidates')}
                className={activeTab === 'candidates' 
                  ? 'bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white font-bold' 
                  : 'border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10 font-bold'}
              >
                <Users className="w-4 h-4 mr-2" />
                Candidates
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
                onClick={() => setActiveTab('leaderboard')}
                className={activeTab === 'leaderboard' 
                  ? 'bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white font-bold' 
                  : 'border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10 font-bold'}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={activeTab === 'insights' ? 'default' : 'outline'}
                onClick={() => setActiveTab('insights')}
                className={activeTab === 'insights' 
                  ? 'bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white font-bold' 
                  : 'border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10 font-bold'}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Insights
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => setActiveTab('overview')}
                className="border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10 font-bold"
              >
                <Target className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Candidates Table */}
        {activeTab === 'candidates' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-xl border-2 border-[#8558ed]/30 shadow-xl shadow-[#8558ed]/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-[#8558ed] flex items-center gap-2">
                      <Users className="w-6 h-6" />
                      All Candidates
                    </CardTitle>
                    <CardDescription className="text-[#8558ed]/60 font-medium">Manage and view candidate profiles</CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={exportData} size="sm" variant="outline" className="border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </motion.div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8558ed]/40" />
                    <Input
                      placeholder="Search by name, email, ID, or college..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-2 border-[#8558ed]/20 focus:border-[#8558ed] font-medium"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-[#8558ed]/10 to-[#b18aff]/10 border-b-2 border-[#8558ed]/20">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-[#8558ed]">Candidate ID</th>
                        <th className="px-4 py-3 text-left font-bold text-[#8558ed]">Name</th>
                        <th className="px-4 py-3 text-left font-bold text-[#8558ed]">Email</th>
                        <th className="px-4 py-3 text-left font-bold text-[#8558ed]">College</th>
                        <th className="px-4 py-3 text-left font-bold text-[#8558ed]">CGPA</th>
                        <th className="px-4 py-3 text-left font-bold text-[#8558ed]">Location</th>
                        <th className="px-4 py-3 text-left font-bold text-[#8558ed]">Status</th>
                        <th className="px-4 py-3 text-center font-bold text-[#8558ed]">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8558ed]/10">
                      {filteredProfiles.map((profile, idx) => {
                        const assessment = assessments.find(a => a.userId === profile.userId);
                        return (
                          <motion.tr
                            key={profile.candidateId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-[#8558ed]/5 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono text-xs text-[#8558ed]/70">{profile.candidateId}</td>
                            <td className="px-4 py-3 font-semibold text-[#030303]">{profile.name}</td>
                            <td className="px-4 py-3 text-[#030303]/70">{profile.email}</td>
                            <td className="px-4 py-3 text-[#030303]/70">{profile.collegeName}</td>
                            <td className="px-4 py-3 font-bold text-[#8558ed]">{profile.cgpa}</td>
                            <td className="px-4 py-3 text-[#030303]/70">{profile.location}</td>
                            <td className="px-4 py-3">
                              {assessment?.completedAt ? (
                                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Completed
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  In Progress
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="relative flex items-center justify-center">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    size="sm"
                                    onClick={() => handleMessageClick(profile.userId)}
                                    className={`${
                                      selectedUser === profile.userId
                                        ? 'bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white shadow-lg shadow-[#8558ed]/30'
                                        : 'bg-white border-2 border-[#8558ed]/30 text-[#8558ed] hover:bg-[#8558ed]/10'
                                    } font-bold transition-all duration-200`}
                                  >
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    Message
                                  </Button>
                                </motion.div>
                                
                                <AnimatePresence>
                                  {selectedUser === profile.userId && showMessageOptions && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                      transition={{ duration: 0.2 }}
                                      className="absolute top-full mt-2 right-0 z-50 bg-white rounded-lg shadow-2xl border-2 border-[#8558ed]/30 p-2 min-w-[200px]"
                                    >
                                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#8558ed]/20">
                                        <span className="text-xs font-bold text-[#8558ed]">Choose Platform</span>
                                        <button
                                          onClick={() => {
                                            setShowMessageOptions(false);
                                            setSelectedUser(null);
                                          }}
                                          className="text-gray-400 hover:text-gray-600"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <div className="space-y-2">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              handleGmailClick(profile);
                                              setShowMessageOptions(false);
                                              setSelectedUser(null);
                                            }}
                                            className="w-full justify-start bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
                                          >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Gmail
                                          </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              handleWhatsAppClick(profile);
                                              setShowMessageOptions(false);
                                              setSelectedUser(null);
                                            }}
                                            className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
                                          >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            WhatsApp
                                          </Button>
                                        </motion.div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-xl border-2 border-[#8558ed]/30 shadow-xl shadow-[#8558ed]/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-[#8558ed] flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Trophy className="w-7 h-7 text-amber-500" />
                      </motion.div>
                      Assessment Leaderboard
                    </CardTitle>
                    <CardDescription className="text-[#8558ed]/60 font-medium">Top performers ranked by total score</CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={exportData} size="sm" variant="outline" className="border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </motion.div>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8558ed]/40" />
                    <Input
                      placeholder="Search leaderboard..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-2 border-[#8558ed]/20 focus:border-[#8558ed] font-medium"
                    />
                  </div>

                  {/* Sort Filter Buttons */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-bold text-[#8558ed]">Sort by:</span>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={() => setSortBy('total')}
                        className={sortBy === 'total'
                          ? 'bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white font-bold'
                          : 'bg-white border-2 border-[#8558ed]/30 text-[#8558ed] hover:bg-[#8558ed]/10 font-bold'}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Total Score
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={() => setSortBy('minesweeper')}
                        className={sortBy === 'minesweeper'
                          ? 'bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white font-bold'
                          : 'bg-white border-2 border-[#8558ed]/30 text-[#8558ed] hover:bg-[#8558ed]/10 font-bold'}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Minesweeper
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={() => setSortBy('unblockMe')}
                        className={sortBy === 'unblockMe'
                          ? 'bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white font-bold'
                          : 'bg-white border-2 border-[#8558ed]/30 text-[#8558ed] hover:bg-[#8558ed]/10 font-bold'}
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Unblock Me
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={() => setSortBy('waterCapacity')}
                        className={sortBy === 'waterCapacity'
                          ? 'bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white font-bold'
                          : 'bg-white border-2 border-[#8558ed]/30 text-[#8558ed] hover:bg-[#8558ed]/10 font-bold'}
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Water Capacity
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-game-teal-100/50 via-game-orange-100/50 to-game-purple-100/50 border-b-2 border-game-teal-500/20">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-game-teal-700">Rank</th>
                        <th className="px-4 py-3 text-left font-bold text-game-teal-700">Candidate ID</th>
                        <th className="px-4 py-3 text-left font-bold text-game-teal-700">Name</th>
                        <th className="px-4 py-3 text-left font-bold text-game-teal-700">College</th>
                        <th className={`px-4 py-3 text-left font-bold ${sortBy === 'total' ? 'text-game-teal-700 bg-game-teal-100/50' : 'text-game-teal-700'}`}>
                          <div className="flex items-center gap-2">
                            Total Score
                            {sortBy === 'total' && <TrendingUp className="w-4 h-4" />}
                          </div>
                        </th>
                        <th className={`px-4 py-3 text-left font-bold ${sortBy === 'minesweeper' ? 'text-game-orange-700 bg-game-orange-100/50' : 'text-game-orange-700'}`}>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Minesweeper
                            {sortBy === 'minesweeper' && <TrendingUp className="w-4 h-4" />}
                          </div>
                        </th>
                        <th className={`px-4 py-3 text-left font-bold ${sortBy === 'unblockMe' ? 'text-game-purple-700 bg-game-purple-100/50' : 'text-game-purple-700'}`}>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Unblock Me
                            {sortBy === 'unblockMe' && <TrendingUp className="w-4 h-4" />}
                          </div>
                        </th>
                        <th className={`px-4 py-3 text-left font-bold ${sortBy === 'waterCapacity' ? 'text-game-teal-700 bg-game-teal-100/50' : 'text-game-teal-700'}`}>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Water Cap.
                            {sortBy === 'waterCapacity' && <TrendingUp className="w-4 h-4" />}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-game-teal-700">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-game-teal-200/30">
                      {filteredLeaderboard.map((entry, index) => {
                        const getRankBadge = () => {
                          if (index === 0) return { color: 'text-amber-500', bg: 'leaderboard-gold', label: '🥇' };
                          if (index === 1) return { color: 'text-gray-500', bg: 'leaderboard-silver', label: '🥈' };
                          if (index === 2) return { color: 'text-amber-700', bg: 'leaderboard-bronze', label: '🥉' };
                          return { color: 'text-game-teal-600', bg: 'leaderboard-default', label: `#${index + 1}` };
                        };
                        
                        const rankBadge = getRankBadge();
                        
                        return (
                        <motion.tr
                          key={entry.candidateId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`hover:bg-game-teal-50/50 transition-colors ${
                            index < 3 ? 'bg-gradient-to-r from-game-teal-50/20 via-game-orange-50/20 to-game-purple-50/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            {index < 3 ? (
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${rankBadge.bg} text-white font-bold text-lg shadow-lg`}
                              >
                                {rankBadge.label}
                              </motion.div>
                            ) : (
                              <span className={`font-extrabold text-xl ${rankBadge.color}`}>#{index + 1}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-game-teal-600/70">{entry.candidateId}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{entry.name}</td>
                          <td className="px-4 py-3 text-gray-600">{entry.collegeName}</td>
                          <td className="px-4 py-3">
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-game-teal-600 to-game-teal-400"
                            >
                              {entry.totalScore}
                            </motion.span>
                          </td>
                          <td className="px-4 py-3 font-bold text-game-orange-600">{entry.gameScores.minesweeper}</td>
                          <td className="px-4 py-3 font-bold text-game-purple-600">{entry.gameScores.unblockMe}</td>
                          <td className="px-4 py-3 font-bold text-game-teal-600">{entry.gameScores.waterCapacity}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                            {new Date(entry.completedAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Candidate Insights */}
        {activeTab === 'insights' && (
          <CandidateInsights profiles={profiles} assessments={assessments} />
        )}
      </div>
    </div>
  );
};
