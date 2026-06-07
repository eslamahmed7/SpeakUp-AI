import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { generateAIResponse, ChatMessage as AIChatMessage } from '../../lib/ai';
import { startListening, stopListening, speakText } from '../../lib/speech';

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  score?: number;
}

export default function ConversationPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { lang, isRTL } = useLanguage();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      type: 'ai',
      text: lang === 'ar'
        ? 'مرحبا! أنا مدربك الذكي للغة الإنجليزية. دعنا نتدرب! قل: مرحبا، كيف حالك اليوم؟'
        : "Hello! I'm your AI English coach. Let's practice! Say: Hello, how are you today?"
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [startTime] = useState(Date.now());
  const [totalScore, setTotalScore] = useState(0);
  const [scoreCount, setScoreCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiTyping]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const generateMockScore = (textLength: number) => {
    // A simplified scoring logic based on text length and some randomness
    const baseScore = Math.min(100, textLength * 2 + 50);
    return Math.floor(Math.random() * 10) + baseScore > 100 ? 100 : baseScore;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isAiTyping) return;

    const currentInput = userInput.trim();
    const userMessage: ChatMessage = {
      type: 'user',
      text: currentInput
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsAiTyping(true);

    // Mock score for this exchange
    const score = generateMockScore(currentInput.length);
    setTotalScore(prev => prev + score);
    setScoreCount(prev => prev + 1);

    // Prepare history for Gemini - must start with 'user' role
    // Exclude the initial AI greeting from history (it's not part of real conversation)
    const allMessages = chatMessages.slice(1); // skip first AI greeting
    const history: AIChatMessage[] = allMessages.map(msg => ({
      role: msg.type === 'ai' ? 'model' : 'user',
      text: msg.text
    }));
    // Only include history pairs (must start with user)
    const validHistory: AIChatMessage[] = [];
    for (let i = 0; i < history.length - 1; i++) {
      if (history[i].role === 'user' || validHistory.length > 0) {
        validHistory.push(history[i]);
      }
    }
    validHistory.push({ role: 'user', text: currentInput });

    const systemInstruction = "You are a friendly and helpful AI English language coach. Keep your answers brief, encouraging, and natural. Correct any obvious grammar mistakes gently.";

    // Get response from AI
    const responseText = await generateAIResponse(validHistory, systemInstruction);

    const aiMessage: ChatMessage = {
      type: 'ai',
      text: responseText,
      score: score
    };

    setChatMessages(prev => [...prev, aiMessage]);
    setIsAiTyping(false);

    // Speak the response
    speakText(responseText, 'en-US');
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setUserInput('');
      startListening(
        (text, isFinal) => {
          setUserInput(text);
          if (isFinal) {
            stopListening();
            setIsRecording(false);
          }
        },
        (error) => {
          console.error("Mic error:", error);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        },
        'en-US' // Listen in English for practice
      );
    }
  };

  const handleEndConversation = async () => {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    try {
      // Save to Supabase
      await supabase.from('conversations').insert({
        type: 'conversation',
        messages: chatMessages,
        score: avgScore,
        duration_seconds: elapsedSeconds,
        user_id: user?.id
      });

      // Update profile
      if (profile) {
        await updateProfile({
          conversation_minutes: (profile.conversation_minutes || 0) + Math.floor(elapsedSeconds / 60),
          total_xp: (profile.total_xp || 0) + 30
        } as any);
      }

      setShowCompletion(true);
    } catch (error) {
      console.error('Error saving conversation:', error);
      setShowCompletion(true);
    }
  };

  if (showCompletion) {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    return (
      <div className={`min-h-screen pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex items-center justify-between gap-4 animate-slide-up">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className={`text-3xl font-bold text-white flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {lang === 'ar' ? 'محادثة ذكية' : 'AI Chat'}
            </h1>
          </div>

          <div className="glass-card p-8 rounded-2xl animate-fade-in text-center space-y-8 py-12">
            <div className="relative">
              <div className="inline-block">
                <div className="text-6xl mb-4 animate-bounce">✨</div>
                <h2 className="text-4xl font-bold gradient-text mb-4">
                  {t('excellent', lang)}
                </h2>
                <p className="text-xl text-slate-300 mb-8">
                  {lang === 'ar'
                    ? 'أكملت محادثة رائعة!'
                    : 'You had a great conversation!'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-slate-400 text-sm">{t('score', lang)}</p>
                <p className="text-2xl font-bold text-primary-400">{avgScore}%</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-slate-400 text-sm">{t('xp', lang)}</p>
                <p className="text-2xl font-bold text-yellow-400">+30</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-slate-400 text-sm">
                  {lang === 'ar' ? 'الرسائل' : 'Messages'}
                </p>
                <p className="text-2xl font-bold text-blue-400">{chatMessages.length}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-slate-400 text-sm">{lang === 'ar' ? 'الوقت' : 'Time'}</p>
                <p className="text-2xl font-bold text-green-400">{Math.floor(elapsedSeconds / 60)}m</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => navigate(-1)}
                className="btn-primary px-8 py-3 rounded-xl"
              >
                {lang === 'ar' ? 'العودة' : 'Back'}
              </button>
              <button
                onClick={() => {
                  setChatMessages([{
                    type: 'ai',
                    text: lang === 'ar'
                      ? 'مرحبا! أنا مدربك الذكي للغة الإنجليزية. دعنا نتدرب! قل: مرحبا، كيف حالك اليوم؟'
                      : "Hello! I'm your AI English coach. Let's practice! Say: Hello, how are you today?"
                  }]);
                  setUserInput('');
                  setTotalScore(0);
                  setScoreCount(0);
                  setShowCompletion(false);
                }}
                className="btn-secondary px-8 py-3 rounded-xl"
              >
                {t('tryAgain', lang)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 animate-slide-up">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className={`text-3xl font-bold text-white flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            {lang === 'ar' ? 'محادثة ذكية' : 'AI Chat'}
          </h1>
        </div>

        {/* Score Display */}
        {scoreCount > 0 && (
          <div className="glass-card p-4 rounded-xl animate-fade-in">
            <p className="text-sm text-slate-400 mb-2">{lang === 'ar' ? 'متوسط النقاط' : 'Average Score'}</p>
            <p className="text-2xl font-bold text-primary-400">
              {Math.round(totalScore / scoreCount)}%
            </p>
          </div>
        )}

        {/* Chat Area */}
        <div className="glass-card p-6 rounded-2xl flex-1 flex flex-col animate-fade-in overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
            {chatMessages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-none'
                      : 'glass-light text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm lg:text-base">{message.text}</p>
                  {message.score && (
                    <p className="text-xs text-slate-300 mt-2">
                      {lang === 'ar' ? '📊 النقاط: ' : '📊 Score: '}{message.score}%
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {isAiTyping && (
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}

          {/* Input Area */}
          <div className="space-y-4 border-t border-white/10 pt-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/50 transition-all"
                disabled={isAiTyping}
              />
              <button
                onClick={handleSendMessage}
                className="btn-primary px-4 py-3 rounded-lg"
                disabled={!userInput.trim() || isAiTyping}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleMicClick}
              className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isRecording
                  ? 'bg-red-500/20 border border-red-500/50 text-red-300 animate-pulse'
                  : 'glass hover:border-primary-500/50 text-slate-300 hover:text-white'
              }`}
            >
              <Mic className={`w-5 h-5 ${isRecording ? 'animate-bounce' : ''}`} />
              {isRecording
                ? lang === 'ar' ? 'جاري الاستماع...' : 'Listening...'
                : lang === 'ar' ? 'اضغط للتحدث' : 'Press to Speak'
              }
            </button>

            {chatMessages.length > 2 && (
              <button
                onClick={handleEndConversation}
                className="btn-secondary w-full py-3 rounded-lg"
              >
                {lang === 'ar' ? 'إنهاء المحادثة' : 'End Conversation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
