import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getProfiles, saveMessage } from '@/lib/storage';
import { ApplicantProfile, MESSAGE_TEMPLATES } from '@/types';
import { ArrowLeft, Mail, MessageSquare, Send, Sparkles, Zap, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
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
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 pointer-events-none"
      >
        <Sparkles className="w-8 h-8 text-[#8558ed]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-32 right-16 pointer-events-none"
      >
        <Zap className="w-10 h-10 text-[#b18aff]/30" />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-xl border-b-2 border-[#8558ed]/20 shadow-lg shadow-[#8558ed]/10 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-5">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/dashboard')}
              className="hover:bg-[#8558ed]/10 font-semibold text-[#8558ed]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto p-6 py-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8558ed] via-[#b18aff] to-[#8558ed] mb-3 flex items-center gap-3">
            <Mail className="w-10 h-10 text-[#8558ed]" />
            Send Messages
          </h1>
          <p className="text-lg text-[#8558ed]/70 font-medium flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Communicate with selected candidates via multiple channels
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="bg-white/80 backdrop-blur-xl border-2 border-[#8558ed]/30 shadow-xl shadow-[#8558ed]/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#8558ed] flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Recipients ({candidates.length})
                </CardTitle>
                <CardDescription className="text-[#8558ed]/60 font-medium">Selected candidates for messaging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                  {candidates.map((candidate, idx) => (
                    <motion.div
                      key={candidate.candidateId}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-gradient-to-r from-[#8558ed]/5 to-[#b18aff]/5 border-2 border-[#8558ed]/20 rounded-xl hover:shadow-md transition-all"
                    >
                      <div className="font-bold text-[#030303]">{candidate.name}</div>
                      <div className="text-sm text-[#8558ed]/70 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {candidate.email}
                      </div>
                      <div className="text-sm text-[#8558ed]/70 flex items-center gap-1 mt-1">
                        <Send className="w-3 h-3" />
                        TG: {candidate.telegramId}
                      </div>
                    </motion.div>
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
          </motion.div>

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
