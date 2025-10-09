import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ApplicantProfile, LOCATIONS, ROLES } from '@/types';
import { saveProfile, getProfileByUserId } from '@/lib/storage';
import { generateCandidateId } from '@/lib/utils';
import { LogOut } from 'lucide-react';

export const ProfileForm: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<ApplicantProfile>>({
    name: '',
    email: user?.email || '',
    phone: '',
    collegeName: '',
    cgpa: '',
    location: '',
    interestedRoles: [],
    telegramId: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Check if profile already exists
    const existingProfile = getProfileByUserId(user.id);
    if (existingProfile) {
      if (existingProfile.profileCompleted) {
        navigate('/applicant/assessment');
      } else {
        setProfile(existingProfile);
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const completeProfile: ApplicantProfile = {
        userId: user.id,
        candidateId: generateCandidateId(),
        name: profile.name!,
        email: profile.email!,
        phone: profile.phone!,
        collegeName: profile.collegeName!,
        cgpa: profile.cgpa!,
        location: profile.location!,
        interestedRoles: profile.interestedRoles!,
        telegramId: profile.telegramId!,
        profileCompleted: true,
        createdAt: new Date().toISOString(),
      };

      saveProfile(completeProfile);
      navigate('/applicant/assessment');
    } catch (error) {
      alert('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    const currentRoles = profile.interestedRoles || [];
    if (currentRoles.includes(role)) {
      setProfile({
        ...profile,
        interestedRoles: currentRoles.filter((r) => r !== role),
      });
    } else {
      setProfile({
        ...profile,
        interestedRoles: [...currentRoles, role],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-600 mt-2">
              Please fill in all the details before proceeding to the assessment
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
            <CardDescription>
              All fields are required. Your Candidate ID will be generated automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram ID *</Label>
                    <Input
                      id="telegram"
                      value={profile.telegramId}
                      onChange={(e) => setProfile({ ...profile, telegramId: e.target.value })}
                      placeholder="@username"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="college">College Name *</Label>
                    <Input
                      id="college"
                      value={profile.collegeName}
                      onChange={(e) => setProfile({ ...profile, collegeName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cgpa">CGPA/GPA *</Label>
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={profile.cgpa}
                      onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Career Intent */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Career Intent</h3>
                <div className="space-y-2">
                  <Label htmlFor="location">Preferred Location *</Label>
                  <select
                    id="location"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    required
                  >
                    <option value="">Select a location</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Interested Roles * (Select at least one)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ROLES.map((role) => (
                      <label
                        key={role}
                        className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={profile.interestedRoles?.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          className="rounded"
                        />
                        <span className="text-sm">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume Upload (Optional)</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      // In a real app, you'd upload this to a server
                      const file = e.target.files?.[0];
                      if (file) {
                        setProfile({ ...profile, resumeUrl: file.name });
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (confirm('Are you sure you want to logout? Your progress will be saved.')) {
                      logout();
                    }
                  }}
                >
                  Save & Logout
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !profile.interestedRoles?.length}
                >
                  {loading ? 'Saving...' : 'Continue to Assessment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
