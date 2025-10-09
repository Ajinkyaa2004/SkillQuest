import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send } from 'lucide-react';
import { ChatMessage } from '@/types';
import { generateId } from '@/lib/utils';

const FAQ_RESPONSES: Record<string, string> = {
  'how long': 'Each game in the assessment runs for exactly 5 minutes. You will complete three games in total.',
  'time': 'Each game in the assessment runs for exactly 5 minutes. You will complete three games in total.',
  'duration': 'Each game in the assessment runs for exactly 5 minutes. You will complete three games in total.',
  'games': 'There are three games: Minesweeper (tests risk assessment), Unblock Me (tests spatial reasoning), and Water Capacity (tests logical sequencing).',
  'what games': 'There are three games: Minesweeper (tests risk assessment), Unblock Me (tests spatial reasoning), and Water Capacity (tests logical sequencing).',
  'score': 'Your score is based on the number of puzzles or levels you complete within the 5-minute time limit for each game. The total score is calculated from all three games.',
  'scoring': 'Your score is based on the number of puzzles or levels you complete within the 5-minute time limit for each game. The total score is calculated from all three games.',
  'unlock': 'Games are unlocked sequentially. You must complete Game 1 (Minesweeper) to unlock Game 2 (Unblock Me), and complete Game 2 to unlock Game 3 (Water Capacity).',
  'locked': 'Games are unlocked sequentially. You must complete Game 1 (Minesweeper) to unlock Game 2 (Unblock Me), and complete Game 2 to unlock Game 3 (Water Capacity).',
  'trial': 'Trial mode is a practice mode available after you complete the scored version of the previous game. It allows you to practice without affecting your score.',
  'practice': 'Trial mode is a practice mode available after you complete the scored version of the previous game. It allows you to practice without affecting your score.',
  'profile': 'You need to complete your profile with personal information, academic details, career preferences, and contact information before starting the assessment.',
  'fullscreen': 'Yes, the assessment must be played in fullscreen mode to ensure a fair testing environment and minimize distractions.',
  'tab switch': 'Tab switching is monitored during the assessment. You will receive warnings, and excessive tab switching (3 times) will result in disqualification.',
  'switch tab': 'Tab switching is monitored during the assessment. You will receive warnings, and excessive tab switching (3 times) will result in disqualification.',
  'results': 'After completing all three games, you can view your results on the Results page. Your scores will also be visible to recruiters on the leaderboard.',
  'leaderboard': 'The leaderboard shows all candidates ranked by their total assessment scores. Recruiters can view this to identify top performers.',
  'contact': 'After completing your assessment, recruiters will contact you via email, WhatsApp, or Telegram based on your performance.',
  'help': 'I can answer questions about assessment rules, game instructions, scoring, profile completion, and general platform navigation. Just ask!',
  'minesweeper': 'Minesweeper tests risk assessment and deductive logic. Left-click to reveal cells, right-click to flag mines. Clear all safe cells without hitting mines.',
  'unblock me': 'Unblock Me tests spatial reasoning. Click a block to select it, then use arrow buttons to move it. Move the red car to the exit on the right.',
  'water capacity': 'Water Capacity tests logical sequencing. Use Fill, Empty, and Pour buttons to transfer water between jugs and achieve the exact target amount.',
  'resume': 'Resume upload is optional during profile completion. You can upload PDF, DOC, or DOCX files up to 5MB.',
  'cgpa': 'Enter your CGPA or GPA on a scale of 0-10. This information is required for profile completion.',
  'location': 'Select your preferred work location from the dropdown menu. This helps recruiters match you with suitable positions.',
  'roles': 'Select one or more roles you are interested in. This helps recruiters understand your career preferences.',
  'telegram': 'Enter your Telegram username (e.g., @username) so recruiters can contact you via Telegram.',
};

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      sender: 'bot',
      message: 'Hi! I\'m here to help you with the IFA assessment. Ask me anything about the games, rules, or profile completion!',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
      if (lowerQuery.includes(key)) {
        return response;
      }
    }

    return "I'm not sure about that. You can ask me about:\n• Assessment duration and rules\n• Game instructions (Minesweeper, Unblock Me, Water Capacity)\n• Scoring system\n• Profile completion\n• Trial mode\n• Fullscreen and tab switching policies\n• Results and leaderboard";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      sender: 'user',
      message: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: generateId(),
        sender: 'bot',
        message: findResponse(input),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickQuestions = [
    'How long is the assessment?',
    'What games are included?',
    'How is scoring done?',
    'What is trial mode?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50 animate-pulse"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl rounded-lg overflow-hidden z-50 flex flex-col bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                IFA Assistant
              </CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-blue-100 mt-1">Ask me anything about the assessment</p>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.message}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="space-y-2 mt-4">
                <p className="text-xs text-gray-600 font-semibold">Quick questions:</p>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="block w-full text-left text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 bg-white border-t">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
