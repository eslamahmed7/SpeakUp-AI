import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Star, UtensilsCrossed, Building2, FileText, ShoppingBag, Briefcase, Coffee, Heart, Map, Mic } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { generateAIResponse, ChatMessage as AIChatMessage } from '../../lib/ai';
import { startListening, stopListening, speakText } from '../../lib/speech';

interface Scenario {
  id: string;
  title_en: string;
  title_ar: string;
  category_en: string;
  category_ar: string;
  difficulty: number;
  ai_prompt: string;
  initial_message_en: string;
  initial_message_ar: string;
  icon: string;
}

interface Message {
  type: 'user' | 'ai';
  text: string;
  score?: number;
}

const STATIC_SCENARIOS: Scenario[] = [
  {
    id: '1',
    title_en: 'Restaurant Ordering',
    title_ar: 'طلب في المطعم',
    category_en: 'Food & Dining',
    category_ar: 'الطعام والطعام',
    difficulty: 1,
    ai_prompt: 'You are a friendly restaurant waiter. Help the customer order food. Speak concisely.',
    initial_message_en: "Welcome to our restaurant! Here is the menu. What would you like to order?",
    initial_message_ar: "أهلا وسهلا بك في مطعمنا! إليك القائمة. ماذا تود أن تطلب؟",
    icon: 'UtensilsCrossed',
  },
  {
    id: '2',
    title_en: 'Hotel Check-in',
    title_ar: 'تسجيل دخول الفندق',
    category_en: 'Travel',
    category_ar: 'السفر',
    difficulty: 1,
    ai_prompt: 'You are a helpful hotel receptionist. Assist the guest with check-in.',
    initial_message_en: "Welcome to Grand Hotel! Do you have a reservation?",
    initial_message_ar: "مرحبا بك في فندق جراند! هل لديك حجز؟",
    icon: 'Building2',
  },
  {
    id: '3',
    title_en: 'Airport Security',
    title_ar: 'أمن المطار',
    category_en: 'Travel',
    category_ar: 'السفر',
    difficulty: 2,
    ai_prompt: 'You are an airport security officer. Check passenger documents professionally.',
    initial_message_en: "Good morning! Please present your passport and boarding pass.",
    initial_message_ar: "صباح الخير! يرجى تقديم جواز سفرك وبطاقة الصعود.",
    icon: 'Building2',
  },
  {
    id: '4',
    title_en: 'Job Interview',
    title_ar: 'مقابلة عمل',
    category_en: 'Business',
    category_ar: 'الأعمال',
    difficulty: 3,
    ai_prompt: 'You are a professional HR interviewer. Conduct a job interview.',
    initial_message_en: "Good morning! Please have a seat. Tell me about yourself.",
    initial_message_ar: "صباح الخير! تفضل بالجلوس. حدثني عن نفسك.",
    icon: 'FileText',
  },
  {
    id: '5',
    title_en: 'Shopping Mall',
    title_ar: 'مركز تسوق',
    category_en: 'Shopping',
    category_ar: 'التسوق',
    difficulty: 1,
    ai_prompt: 'You are a helpful shopping assistant. Help the customer find what they need.',
    initial_message_en: "Hello! Can I help you find something?",
    initial_message_ar: "مرحبا! هل يمكنني مساعدتك في العثور على شيء ما؟",
    icon: 'ShoppingBag',
  },
  {
    id: '6',
    title_en: 'Business Meeting',
    title_ar: 'اجتماع عمل',
    category_en: 'Business',
    category_ar: 'الأعمال',
    difficulty: 3,
    ai_prompt: 'You are a business professional in a meeting. Discuss project details professionally.',
    initial_message_en: "Good afternoon. Let's discuss the quarterly targets.",
    initial_message_ar: "مساء الخير. دعنا نناقش أهداف الربع السنوي.",
    icon: 'Briefcase',
  },
  {
    id: '7',
    title_en: 'Coffee Shop',
    title_ar: 'مقهى',
    category_en: 'Food & Dining',
    category_ar: 'الطعام والطعام',
    difficulty: 1,
    ai_prompt: 'You are a barista at a coffee shop. Take the customer order.',
    initial_message_en: "Hi there! What can I get you today?",
    initial_message_ar: "مرحبا! ماذا يمكنني أن أحضر لك اليوم؟",
    icon: 'Coffee',
  },
  {
    id: '8',
    title_en: 'Hospital Visit',
    title_ar: 'زيارة المستشفى',
    category_en: 'Health',
    category_ar: 'الصحة',
    difficulty: 2,
    ai_prompt: 'You are a doctor. Ask about symptoms and provide advice.',
    initial_message_en: "Good morning. What seems to be the problem?",
    initial_message_ar: "صباح الخير. ما هي المشكلة؟",
    icon: 'Heart',
  },
  {
    id: '9',
    title_en: 'Tourist Guide',
    title_ar: 'دليل سياحي',
    category_en: 'Travel',
    category_ar: 'السفر',
    difficulty: 2,
    ai_prompt: 'You are a knowledgeable tour guide. Share information about attractions.',
    initial_message_en: "Welcome to the city! Where would you like to visit?",
    initial_message_ar: "أهلا وسهلا بك في المدينة! أين تود أن تزور؟",
    icon: 'Map',
  },
];

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  UtensilsCrossed,
  Building2,
  FileText,
  ShoppingBag,
  Briefcase,
  Coffee,
  Heart,
  Map,
};

export default function RoleplayPage() {
  const { scenarioId } = useParams<{ scenarioId?: string }>();
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { lang, isRTL } = useLanguage();

  const [scenarios, setScenarios] = useState<Scenario[]>(STATIC_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const { data } = await supabase
          .from('roleplay_scenarios')
          .select('*');

        if (data && data.length > 0) {
          setScenarios(data);
        }
      } catch (error) {
        console.error('Error fetching scenarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  useEffect(() => {
    if (scenarioId && scenarios.length > 0) {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (scenario) {
        startScenario(scenario);
      }
    }
  }, [scenarioId, scenarios]);

  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        type: 'ai',
        text: lang === 'ar' ? scenario.initial_message_ar : scenario.initial_message_en,
      },
    ]);
    setScore(0);
    setStartTime(Date.now());
    setUserInput('');
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !selectedScenario || isAiTyping) return;

    const currentInput = userInput.trim();
    const userMessage: Message = { type: 'user', text: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsAiTyping(true);

    // Calculate score based on message length and quality indicators
    let messageScore = 0;
    if (currentInput.length > 20) messageScore += 10;
    if (currentInput.length > 40) messageScore += 10;
    if (currentInput.match(/[?!.]/)) messageScore += 5;

    setScore(prev => prev + messageScore);

    // Prepare history for Gemini - must start with 'user' role
    // Skip any initial AI greeting messages
    const allMessages = messages.filter((m, idx) => !(idx === 0 && m.type === 'ai'));
    const history: AIChatMessage[] = allMessages.map(msg => ({
      role: msg.type === 'ai' ? 'model' : 'user',
      text: msg.text
    }));
    // Ensure history starts with 'user'
    const validHistory: AIChatMessage[] = [];
    for (let i = 0; i < history.length; i++) {
      if (history[i].role === 'user' || validHistory.length > 0) {
        validHistory.push(history[i]);
      }
    }
    validHistory.push({ role: 'user', text: currentInput });

    // AI Response
    const responseText = await generateAIResponse(validHistory, selectedScenario.ai_prompt);
    setMessages(prev => [...prev, { type: 'ai', text: responseText }]);
    setIsAiTyping(false);

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
        'en-US'
      );
    }
  };

  const handleEndRoleplay = async () => {
    if (!selectedScenario || !user || startTime === null) return;

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      // Save conversation
      await supabase.from('conversations').insert({
        user_id: user.id,
        type: 'roleplay',
        scenario_id: selectedScenario.id,
        messages: messages,
        score,
        duration_seconds: durationSeconds,
      });

      // Update profile XP
      if (profile) {
        await updateProfile({
          total_xp: profile.total_xp + 30,
        } as any);
      }

      // Show completion and reset
      alert(lang === 'ar'
        ? `تم حفظ الحوار! حصلت على 30 نقطة خبرة`
        : `Conversation saved! You earned 30 XP`);

      setSelectedScenario(null);
      setMessages([]);
      setScore(0);
      setStartTime(null);
    } catch (error) {
      console.error('Error saving roleplay:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>{t('loading', lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 animate-slide-up">
          <button
            onClick={() => selectedScenario ? setSelectedScenario(null) : navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className={`text-3xl font-bold text-white flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            {lang === 'ar' ? 'تمثيل الأدوار' : 'Role Play'}
          </h1>
        </div>

        {selectedScenario ? (
          // Chat interface
          <div className="glass-card p-6 rounded-2xl flex-1 flex flex-col animate-fade-in overflow-hidden h-[600px]">
            {/* Scenario info */}
            <div className="mb-4 pb-4 border-b border-white/10 shrink-0">
              <h2 className={`text-xl font-bold text-white mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? selectedScenario.title_ar : selectedScenario.title_en}
              </h2>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{lang === 'ar' ? selectedScenario.category_ar : selectedScenario.category_en}</span>
                <span>{lang === 'ar' ? `النقاط: ${score}` : `Score: ${score}`}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 py-2 pr-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-none'
                        : 'glass-light text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing indicator */}
            {isAiTyping && (
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}

            {/* Input Area */}
            <div className="shrink-0 space-y-4 border-t border-white/10 pt-4">
              <div className="flex gap-2">
                <button
                  onClick={handleMicClick}
                  className={`p-3 rounded-lg flex items-center justify-center transition-colors ${
                    isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={lang === 'ar' ? 'اكتب ردك...' : 'Type your response...'}
                  className="input-field flex-1"
                  disabled={isAiTyping}
                />
                <button
                  onClick={handleSendMessage}
                  className="btn-primary p-3 rounded-lg"
                  disabled={!userInput.trim() || isAiTyping}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* End button */}
              {messages.length >= 3 && (
                <button
                  onClick={handleEndRoleplay}
                  className="btn-secondary w-full py-3 rounded-lg"
                >
                  {lang === 'ar' ? 'إنهاء التمثيل' : 'End Roleplay'}
                </button>
              )}
            </div>
          </div>
        ) : (
          // Scenarios grid
          <>
            <p className={`text-slate-300 text-lg ${isRTL ? 'text-right' : 'text-left'}`}>
              {lang === 'ar'
                ? 'اختر سيناريو لممارسة المحادثة'
                : 'Choose a scenario to practice conversation'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {scenarios.map((scenario, idx) => {
                const Icon = ICON_MAP[scenario.icon as keyof typeof ICON_MAP] || Map;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => startScenario(scenario)}
                    className="glass-card p-6 rounded-2xl hover:bg-white/10 transition-all hover:shadow-xl hover:shadow-primary-500/20 text-left animate-slide-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {/* Icon background */}
                    <div className="mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-2">
                      {lang === 'ar' ? scenario.title_ar : scenario.title_en}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">
                      {lang === 'ar' ? scenario.category_ar : scenario.category_en}
                    </p>

                    {/* Difficulty stars */}
                    <div className="flex gap-1">
                      {[...Array(scenario.difficulty)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
