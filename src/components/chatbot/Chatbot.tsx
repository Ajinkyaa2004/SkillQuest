import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/types';
import { generateId } from '@/lib/utils';
import { fuzzySearch, getDefaultResponse } from '@/lib/fuzzy-search';
import { isAIEnabled, getAIResponse, generateRelatedQuestions } from '@/lib/chatbot-ai';

// Keyframes for animations
const styles = `
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes bounceDot {
    0%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .chat-message-bot {
    animation: slideInLeft 0.3s ease-out;
  }
  
  .chat-message-user {
    animation: slideInRight 0.3s ease-out;
  }
  
  .bounce-dot {
    animation: bounceDot 1.4s infinite ease-in-out;
  }
  
  .bounce-dot:nth-child(1) {
    animation-delay: 0s;
  }
  
  .bounce-dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .bounce-dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  .chat-button-bounce:hover {
    animation: bounce 0.6s ease-in-out;
  }
  
  .glassmorphism {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
`;

// Conversation history for AI context
interface ConversationContext {
  role: 'user' | 'assistant';
  content: string;
}

export const Chatbot: React.FC = () => {
  // Inject styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      sender: 'bot',
      message: isAIEnabled() 
        ? '👋 Hi! I\'m your AI-powered IFA assistant. Ask me anything about the games, rules, or profile completion!' 
        : '👋 Hi! I\'m here to help you with the IFA assessment. Ask me anything about the games, rules, or profile completion!',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationContext[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findResponse = async (query: string): Promise<{ answer: string; relatedQuestions: string[] }> => {
    // Try fuzzy search first
    const faqResult = fuzzySearch(query);
    
    if (faqResult) {
      return {
        answer: faqResult.answer,
        relatedQuestions: generateRelatedQuestions(query, faqResult.answer),
      };
    }

    // If AI is enabled, use AI for response
    if (isAIEnabled()) {
      try {
        const aiResponse = await getAIResponse(query, conversationHistory);
        return {
          answer: aiResponse,
          relatedQuestions: generateRelatedQuestions(query, aiResponse),
        };
      } catch (error) {
        console.error('AI Error:', error);
        // Fallback to default response
        return {
          answer: getDefaultResponse(),
          relatedQuestions: [
            'How long is the assessment?',
            'What games are included?',
            'How is scoring done?',
          ],
        };
      }
    }

    // Default response
    return {
      answer: getDefaultResponse(),
      relatedQuestions: [
        'How long is the assessment?',
        'What games are included?',
        'How is scoring done?',
      ],
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      sender: 'user',
      message: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Update conversation history for AI context
    const newHistory: ConversationContext[] = [
      ...conversationHistory,
      { role: 'user', content: input },
    ];

    try {
      // Simulate realistic typing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { answer, relatedQuestions } = await findResponse(input);
      
      const botResponse: ChatMessage = {
        id: generateId(),
        sender: 'bot',
        message: answer,
        timestamp: new Date().toISOString(),
        relatedQuestions,
        feedback: null,
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Update conversation history
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: answer },
      ]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorResponse: ChatMessage = {
        id: generateId(),
        sender: 'bot',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
    
    // Log feedback for analytics (in production, send to backend)
    console.log('Feedback received:', { messageId, feedback });
  };

  const handleRelatedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  const quickQuestions = [
    'What is a good score?',
    'Can I retake the assessment?',
    'What happens if I fail a game?',
    'Can I pause the game?',
    'What if my internet disconnects?',
    'How long is the assessment?',
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
          className="chat-button-bounce fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 hover:scale-110 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 hover:shadow-blue-500/50"
          style={{
            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)'
          }}
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="glassmorphism fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col border border-white/20"
          style={{
            animation: 'scaleIn 0.3s ease-out',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)'
          }}
        >
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                {isAIEnabled() ? (
                  <Sparkles className="w-5 h-5 mr-2" />
                ) : (
                  <MessageCircle className="w-5 h-5 mr-2" />
                )}
                IFA SkillQuest Assistant {isAIEnabled() && <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">AI</span>}
              </CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              {isAIEnabled() ? 'AI-powered assistant • Ask me anything' : 'Ask me anything about the assessment'}
            </p>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-blue-50/30">
            {messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md ${
                      message.sender === 'user'
                        ? 'chat-message-user bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                        : 'chat-message-bot bg-gradient-to-br from-white to-blue-50 border border-blue-100 text-gray-800'
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <p className="text-sm whitespace-pre-line">{message.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      
                      {/* Feedback buttons for bot messages */}
                      {message.sender === 'bot' && (
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleFeedback(message.id, 'positive')}
                            className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                              message.feedback === 'positive' ? 'text-green-600' : 'text-gray-400'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, 'negative')}
                            className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                              message.feedback === 'negative' ? 'text-red-600' : 'text-gray-400'
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Related questions */}
                {message.sender === 'bot' && message.relatedQuestions && message.relatedQuestions.length > 0 && (
                  <div className="mt-2 ml-2 space-y-1">
                    <p className="text-xs text-gray-600 font-semibold">Related questions:</p>
                    {message.relatedQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRelatedQuestion(question)}
                        className="block text-left text-xs px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl px-5 py-3 flex items-center space-x-2 shadow-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full bounce-dot"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full bounce-dot"></div>
                    <div className="w-2 h-2 bg-pink-600 rounded-full bounce-dot"></div>
                  </div>
                  <span className="text-sm text-gray-600 ml-2">Thinking...</span>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="space-y-2 mt-4">
                <p className="text-xs text-gray-600 font-semibold">Quick questions:</p>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="block w-full text-left text-sm px-3 py-2 bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-xl hover:from-blue-50 hover:to-purple-50 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 glassmorphism border-t border-gray-200/50">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button onClick={handleSend} size="icon" disabled={isTyping || !input.trim()}>
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
