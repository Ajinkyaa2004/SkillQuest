import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getProfiles, getAssessments, getLeaderboard } from '@/lib/storage';
import { ApplicantProfile, Assessment, LeaderboardEntry } from '@/types';
import { Users, Trophy, CheckCircle, Clock, LogOut, Search, Download, Mail } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ApplicantProfile[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'leaderboard'>('overview');

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

  const filteredLeaderboard = leaderboard.filter(entry =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCandidateSelection = (candidateId: string) => {
    const newSelection = new Set(selectedCandidates);
    if (newSelection.has(candidateId)) {
      newSelection.delete(candidateId);
    } else {
      newSelection.add(candidateId);
    }
    setSelectedCandidates(newSelection);
  };

  const selectAll = () => {
    if (activeTab === 'candidates') {
      setSelectedCandidates(new Set(filteredProfiles.map(p => p.candidateId)));
    } else {
      setSelectedCandidates(new Set(filteredLeaderboard.map(l => l.candidateId)));
    }
  };

  const deselectAll = () => {
    setSelectedCandidates(new Set());
  };

  const sendMessages = () => {
    if (selectedCandidates.size === 0) {
      toast.error('Please select at least one candidate.', {
        duration: 4000,
        icon: '👥',
      });
      return;
    }
    navigate('/admin/messaging', { state: { selectedCandidates: Array.from(selectedCandidates) } });
  };

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

  const completedAssessments = assessments.filter(a => a.completedAt).length;
  const averageScore = leaderboard.length > 0
    ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalScore, 0) / leaderboard.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">IFA Hiring Platform</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Applicants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600 mr-3" />
                    <div className="text-3xl font-bold">{profiles.length}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                    <div className="text-3xl font-bold">{completedAssessments}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                    <div className="text-3xl font-bold">{profiles.length - completedAssessments}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Trophy className="w-8 h-8 text-purple-600 mr-3" />
                    <div className="text-3xl font-bold">{averageScore}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Button onClick={() => setActiveTab('candidates')} className="h-24 text-lg">
                <Users className="w-6 h-6 mr-2" />
                View All Candidates
              </Button>
              <Button onClick={() => setActiveTab('leaderboard')} className="h-24 text-lg">
                <Trophy className="w-6 h-6 mr-2" />
                View Leaderboard
              </Button>
              <Button onClick={sendMessages} variant="outline" className="h-24 text-lg">
                <Mail className="w-6 h-6 mr-2" />
                Send Messages
              </Button>
            </div>
          </>
        )}

        {/* Tab Navigation */}
        {activeTab !== 'overview' && (
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === 'candidates' ? 'default' : 'outline'}
              onClick={() => setActiveTab('candidates')}
            >
              Candidates
            </Button>
            <Button
              variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
              onClick={() => setActiveTab('leaderboard')}
            >
              Leaderboard
            </Button>
          </div>
        )}

        {/* Candidates Table */}
        {activeTab === 'candidates' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Candidates</CardTitle>
                  <CardDescription>Manage and view candidate profiles</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={selectAll} size="sm" variant="outline">Select All</Button>
                  <Button onClick={deselectAll} size="sm" variant="outline">Deselect All</Button>
                  <Button onClick={sendMessages} size="sm" disabled={selectedCandidates.size === 0}>
                    <Mail className="w-4 h-4 mr-2" />
                    Message ({selectedCandidates.size})
                  </Button>
                  <Button onClick={exportData} size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, ID, or college..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} />
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">Candidate ID</th>
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Email</th>
                      <th className="px-4 py-3 text-left font-semibold">College</th>
                      <th className="px-4 py-3 text-left font-semibold">CGPA</th>
                      <th className="px-4 py-3 text-left font-semibold">Location</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProfiles.map((profile) => {
                      const assessment = assessments.find(a => a.userId === profile.userId);
                      return (
                        <tr key={profile.candidateId} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.has(profile.candidateId)}
                              onChange={() => toggleCandidateSelection(profile.candidateId)}
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">{profile.candidateId}</td>
                          <td className="px-4 py-3 font-medium">{profile.name}</td>
                          <td className="px-4 py-3">{profile.email}</td>
                          <td className="px-4 py-3">{profile.collegeName}</td>
                          <td className="px-4 py-3">{profile.cgpa}</td>
                          <td className="px-4 py-3">{profile.location}</td>
                          <td className="px-4 py-3">
                            {assessment?.completedAt ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Completed
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                In Progress
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                    Assessment Leaderboard
                  </CardTitle>
                  <CardDescription>Top performers ranked by total score</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={selectAll} size="sm" variant="outline">Select All</Button>
                  <Button onClick={deselectAll} size="sm" variant="outline">Deselect All</Button>
                  <Button onClick={sendMessages} size="sm" disabled={selectedCandidates.size === 0}>
                    <Mail className="w-4 h-4 mr-2" />
                    Message ({selectedCandidates.size})
                  </Button>
                  <Button onClick={exportData} size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search leaderboard..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} />
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">Rank</th>
                      <th className="px-4 py-3 text-left font-semibold">Candidate ID</th>
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left font-semibold">College</th>
                      <th className="px-4 py-3 text-left font-semibold">Total Score</th>
                      <th className="px-4 py-3 text-left font-semibold">Minesweeper</th>
                      <th className="px-4 py-3 text-left font-semibold">Unblock Me</th>
                      <th className="px-4 py-3 text-left font-semibold">Water Cap.</th>
                      <th className="px-4 py-3 text-left font-semibold">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredLeaderboard.map((entry, index) => (
                      <tr key={entry.candidateId} className={`hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.has(entry.candidateId)}
                            onChange={() => toggleCandidateSelection(entry.candidateId)}
                          />
                        </td>
                        <td className="px-4 py-3 font-bold">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{entry.candidateId}</td>
                        <td className="px-4 py-3 font-medium">{entry.name}</td>
                        <td className="px-4 py-3">{entry.collegeName}</td>
                        <td className="px-4 py-3">
                          <span className="text-lg font-bold text-blue-600">{entry.totalScore}</span>
                        </td>
                        <td className="px-4 py-3">{entry.gameScores.minesweeper}</td>
                        <td className="px-4 py-3">{entry.gameScores.unblockMe}</td>
                        <td className="px-4 py-3">{entry.gameScores.waterCapacity}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {formatDate(entry.completedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
