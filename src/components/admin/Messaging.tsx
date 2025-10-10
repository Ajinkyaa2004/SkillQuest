import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getProfiles, saveMessage } from '@/lib/storage';
import { ApplicantProfile, MESSAGE_TEMPLATES } from '@/types';
import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';

export const Messaging: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<ApplicantProfile[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('interview-invitation');
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set(['email']));
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const state = location.state as { selectedCandidates?: string[] };
    if (state?.selectedCandidates) {
      setSelectedCandidates(state.selectedCandidates);
      const profiles = getProfiles();
      const selected = profiles.filter(p => (state.selectedCandidates ?? []).includes(p.candidateId));
      setCandidates(selected);
    } else {
      navigate('/admin/dashboard');
    }
  }, [user, navigate, location]);

  const toggleChannel = (channel: string) => {
    const newChannels = new Set(selectedChannels);
    if (newChannels.has(channel)) {
      newChannels.delete(channel);
    } else {
      newChannels.add(channel);
    }
    setSelectedChannels(newChannels);
  };

  const getPreviewMessage = (channel: 'email' | 'whatsapp' | 'telegram') => {
    const template = MESSAGE_TEMPLATES[selectedTemplate as keyof typeof MESSAGE_TEMPLATES];
    if (!template) return '';
    
    const sampleName = candidates.length > 0 ? candidates[0].name : 'John Doe';
    return template[channel].replace('{name}', sampleName);
  };

  const sendMessages = async () => {
    if (selectedChannels.size === 0) {
      toast.error('Please select at least one communication channel.', {
        duration: 4000,
        icon: '📨',
      });
      return;
    }

    setSending(true);

    // Simulate sending messages
    await new Promise(resolve => setTimeout(resolve, 2000));

    selectedChannels.forEach(channel => {
      const message = {
        id: generateId(),
        type: channel as 'email' | 'whatsapp' | 'telegram',
        template: selectedTemplate,
        recipients: candidates.map(c => c.email),
        sentAt: new Date().toISOString(),
        status: 'sent' as const,
      };
      saveMessage(message);
    });

    setSending(false);
    toast.success(`Messages sent successfully to ${candidates.length} candidate(s) via ${Array.from(selectedChannels).join(', ')}!`, {
      duration: 5000,
      icon: '✅',
    });
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Messages</h1>
        <p className="text-gray-600 mb-6">
          Communicate with selected candidates via multiple channels
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recipients ({candidates.length})</CardTitle>
                <CardDescription>Selected candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {candidates.map(candidate => (
                    <div key={candidate.candidateId} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-semibold">{candidate.name}</div>
                      <div className="text-xs text-gray-600">{candidate.email}</div>
                      <div className="text-xs text-gray-600">TG: {candidate.telegramId}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Template</CardTitle>
                <CardDescription>Choose a pre-defined template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => (
                  <label
                    key={key}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === key ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={key}
                      checked={selectedTemplate === key}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold">{template.name}</div>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Channels</CardTitle>
                <CardDescription>Select channels to send messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedChannels.has('email')}
                    onChange={() => toggleChannel('email')}
                    className="mr-3"
                  />
                  <Mail className="w-5 h-5 mr-2 text-blue-600" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-xs text-gray-600">Send via email to {candidates.length} recipients</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedChannels.has('whatsapp')}
                    onChange={() => toggleChannel('whatsapp')}
                    className="mr-3"
                  />
                  <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-xs text-gray-600">Send via WhatsApp (simulated)</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedChannels.has('telegram')}
                    onChange={() => toggleChannel('telegram')}
                    className="mr-3"
                  />
                  <Send className="w-5 h-5 mr-2 text-blue-500" />
                  <div>
                    <div className="font-semibold">Telegram</div>
                    <div className="text-xs text-gray-600">Send via Telegram to {candidates.length} users</div>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Preview</CardTitle>
                <CardDescription>How your message will appear</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedChannels.has('email') && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs font-semibold text-blue-800 mb-2">EMAIL</div>
                    <div className="text-sm text-gray-800">{getPreviewMessage('email')}</div>
                  </div>
                )}

                {selectedChannels.has('whatsapp') && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-xs font-semibold text-green-800 mb-2">WHATSAPP</div>
                    <div className="text-sm text-gray-800">{getPreviewMessage('whatsapp')}</div>
                  </div>
                )}

                {selectedChannels.has('telegram') && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs font-semibold text-blue-800 mb-2">TELEGRAM</div>
                    <div className="text-sm text-gray-800">{getPreviewMessage('telegram')}</div>
                  </div>
                )}

                {selectedChannels.size === 0 && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                    Select at least one channel to preview messages
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle>Ready to Send?</CardTitle>
                <CardDescription className="text-blue-100">
                  Messages will be sent to {candidates.length} candidate(s) via {selectedChannels.size} channel(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={sendMessages}
                  disabled={sending || selectedChannels.size === 0}
                  className="w-full bg-white text-blue-600 hover:bg-gray-100"
                  size="lg"
                >
                  {sending ? (
                    'Sending Messages...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Messages Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
              <strong>Note:</strong> This is a simulated messaging system for the MVP. In production, this would integrate with actual email, WhatsApp, and Telegram APIs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
