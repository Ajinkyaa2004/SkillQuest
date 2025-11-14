import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getProfiles } from '@/lib/storage';
import { ApplicantProfile, MESSAGE_TEMPLATES } from '@/types';
import { ArrowLeft, Mail, MessageSquare, Send, Sparkles, Zap, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const Messaging: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      const profiles = getProfiles();
      const selected = profiles.filter((p: ApplicantProfile) => (state.selectedCandidates ?? []).includes(p.candidateId));
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

    // In a real application, this would call the backend API to send messages
    // For now, we just log the messages that would be sent
    selectedChannels.forEach(channel => {
      console.log('Sending message via', channel, 'to', candidates.length, 'candidates');
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Recipients Card */}
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
                        ID: {candidate.candidateId}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Template Card */}
            <Card className="bg-white/80 backdrop-blur-xl border-2 border-[#8558ed]/30 shadow-xl shadow-[#8558ed]/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#8558ed] flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  Message Template
                </CardTitle>
                <CardDescription className="text-[#8558ed]/60 font-medium">Choose a pre-defined template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(MESSAGE_TEMPLATES).map(([key, template]: [string, any], idx) => (
                  <motion.label
                    key={key}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedTemplate === key
                        ? 'border-[#8558ed] bg-gradient-to-r from-[#8558ed]/10 to-[#b18aff]/10 shadow-md'
                        : 'border-[#8558ed]/20 hover:bg-[#8558ed]/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={key}
                      checked={selectedTemplate === key}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="mr-4 accent-[#8558ed] w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-[#030303]">{template.name}</div>
                    </div>
                    {selectedTemplate === key && (
                      <CheckCircle2 className="w-5 h-5 text-[#8558ed]" />
                    )}
                  </motion.label>
                ))}
              </CardContent>
            </Card>

            {/* Channels Card */}
            <Card className="bg-white/80 backdrop-blur-xl border-2 border-[#8558ed]/30 shadow-xl shadow-[#8558ed]/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#8558ed] flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Communication Channels
                </CardTitle>
                <CardDescription className="text-[#8558ed]/60 font-medium">Select channels to send messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedChannels.has('email')
                      ? 'border-[#8558ed] bg-gradient-to-r from-[#8558ed]/10 to-[#b18aff]/10 shadow-md'
                      : 'border-[#8558ed]/20 hover:bg-[#8558ed]/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.has('email')}
                    onChange={() => toggleChannel('email')}
                    className="mr-4 accent-[#8558ed] w-5 h-5"
                  />
                  <Mail className="w-6 h-6 mr-3 text-[#8558ed]" />
                  <div className="flex-1">
                    <div className="font-bold text-[#030303]">Email</div>
                    <div className="text-sm text-[#8558ed]/70">Send via email to {candidates.length} recipients</div>
                  </div>
                  {selectedChannels.has('email') && (
                    <CheckCircle2 className="w-5 h-5 text-[#8558ed]" />
                  )}
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedChannels.has('whatsapp')
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md'
                      : 'border-[#8558ed]/20 hover:bg-[#8558ed]/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.has('whatsapp')}
                    onChange={() => toggleChannel('whatsapp')}
                    className="mr-4 accent-green-500 w-5 h-5"
                  />
                  <MessageSquare className="w-6 h-6 mr-3 text-green-600" />
                  <div className="flex-1">
                    <div className="font-bold text-[#030303]">WhatsApp</div>
                    <div className="text-sm text-green-700/70">Send via WhatsApp (simulated)</div>
                  </div>
                  {selectedChannels.has('whatsapp') && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedChannels.has('telegram')
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-sky-50 shadow-md'
                      : 'border-[#8558ed]/20 hover:bg-[#8558ed]/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.has('telegram')}
                    onChange={() => toggleChannel('telegram')}
                    className="mr-4 accent-blue-500 w-5 h-5"
                  />
                  <Send className="w-6 h-6 mr-3 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-bold text-[#030303]">Telegram</div>
                    <div className="text-sm text-blue-700/70">Send via Telegram to {candidates.length} users</div>
                  </div>
                  {selectedChannels.has('telegram') && (
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  )}
                </motion.label>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Preview */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Preview Card */}
            <Card className="bg-white/80 backdrop-blur-xl border-2 border-[#8558ed]/30 shadow-xl shadow-[#8558ed]/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#8558ed] flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Message Preview
                </CardTitle>
                <CardDescription className="text-[#8558ed]/60 font-medium">How your message will appear</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedChannels.has('email') && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-5 bg-gradient-to-r from-[#8558ed]/10 to-[#b18aff]/10 border-2 border-[#8558ed]/30 rounded-xl"
                  >
                    <div className="text-xs font-bold text-[#8558ed] mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      EMAIL
                    </div>
                    <div className="text-sm text-[#030303] leading-relaxed whitespace-pre-wrap">{getPreviewMessage('email')}</div>
                  </motion.div>
                )}

                {selectedChannels.has('whatsapp') && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl"
                  >
                    <div className="text-xs font-bold text-green-700 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      WHATSAPP
                    </div>
                    <div className="text-sm text-[#030303] leading-relaxed whitespace-pre-wrap">{getPreviewMessage('whatsapp')}</div>
                  </motion.div>
                )}

                {selectedChannels.has('telegram') && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-5 bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-300 rounded-xl"
                  >
                    <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      TELEGRAM
                    </div>
                    <div className="text-sm text-[#030303] leading-relaxed whitespace-pre-wrap">{getPreviewMessage('telegram')}</div>
                  </motion.div>
                )}

                {selectedChannels.size === 0 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-6 bg-gradient-to-r from-[#8558ed]/5 to-[#b18aff]/5 border-2 border-[#8558ed]/20 rounded-xl text-center"
                  >
                    <AlertCircle className="w-12 h-12 text-[#8558ed]/50 mx-auto mb-3" />
                    <p className="text-[#8558ed]/70 font-medium">Select at least one channel to preview messages</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Send Button Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gradient-to-r from-[#8558ed] to-[#b18aff] text-white border-2 border-white/20 shadow-2xl shadow-[#8558ed]/30">
                <CardHeader>
                  <CardTitle className="text-2xl font-extrabold flex items-center gap-2">
                    <Sparkles className="w-7 h-7" />
                    Ready to Send?
                  </CardTitle>
                  <CardDescription className="text-white/90 font-medium text-base">
                    Messages will be sent to <strong>{candidates.length}</strong> candidate(s) via <strong>{selectedChannels.size}</strong> channel(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={sendMessages}
                      disabled={sending || selectedChannels.size === 0}
                      className="w-full h-16 bg-white text-[#8558ed] hover:bg-gray-100 font-bold text-lg shadow-xl disabled:opacity-50"
                      size="lg"
                    >
                      {sending ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap className="w-6 h-6 mr-2" />
                          </motion.div>
                          Sending Messages...
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6 mr-2" />
                          Send Messages Now
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Note */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl text-sm"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-800">Note:</strong>
                  <span className="text-amber-700"> This is a simulated messaging system for the MVP. In production, this would integrate with actual email, WhatsApp, and Telegram APIs.</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
