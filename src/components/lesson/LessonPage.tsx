import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Check, X } from 'lucide-react';
import { speakText } from '../../lib/speech';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';

interface Lesson {
  id: string;
  level_id: string;
  title_en: string;
  title_ar: string;
  type: 'lesson' | 'quiz' | 'pronunciation' | 'conversation';
  duration: number;
  xp_reward: number;
  order_index: number;
  content: {
    phrases?: Array<{
      en: string;
      ar: string;
      pron: string;
    }>;
    questions?: Array<{
      q_en: string;
      q_ar: string;
      options: string[];
      answer: number;
    }>;
    words?: Array<{
      word: string;
      ar: string;
    }>;
    scenario?: {
      text_en: string;
      text_ar: string;
    };
  };
}

interface QuizResult {
  questionIndex: number;
  selected: number | null;
  correct: boolean;
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { lang, isRTL } = useLanguage();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [recordingScore, setRecordingScore] = useState<number | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Array<{ type: 'user' | 'ai'; text: string }>>([]);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchLesson = async () => {
      try {
        const { data } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data) {
          setLesson(data as Lesson);
          // Initialize conversation with welcome message
          if (data.type === 'conversation') {
            setConversationMessages([
              {
                type: 'ai',
                text: lang === 'ar'
                  ? 'مرحبا! كيف حالك اليوم؟'
                  : 'Hello! How are you today?'
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id, lang]);

  // Save progress when lesson is completed
  useEffect(() => {
    if (!showCompletion || !user || !lesson) return;

    const saveProgressAsync = async () => {
      const xpEarned = lesson.xp_reward;
      const score = calculateScore();

      try {
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          score,
          xp_earned: xpEarned,
        });

        if (profile) {
          await updateProfile({
            total_xp: profile.total_xp + xpEarned,
            lessons_completed: profile.lessons_completed + 1,
          } as any);
        }
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };

    saveProgressAsync();
  }, [showCompletion, user, lesson, profile, updateProfile]);


  const calculateScore = () => {
    if (lesson?.type === 'quiz' && quizResults.length > 0) {
      const correct = quizResults.filter(r => r.correct).length;
      return Math.round((correct / quizResults.length) * 100);
    }
    if (lesson?.type === 'pronunciation') {
      return recordingScore || 0;
    }
    return 100; // Lessons and conversation auto-pass
  };

  const handleLessonNext = () => {
    const phrases = lesson?.content.phrases || [];
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handleLessonPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const questions = lesson?.content.questions || [];
    const isCorrect = answerIndex === questions[currentIndex].answer;
    setSelectedAnswer(answerIndex);
    setQuizResults([...quizResults, { questionIndex: currentIndex, selected: answerIndex, correct: isCorrect }]);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowCompletion(true);
      }
    }, 1200);
  };

  const handlePronunciationRecord = () => {
    // Mock recording - automatically generate score between 70-95
    const mockScore = Math.floor(Math.random() * (95 - 70 + 1)) + 70;
    setRecordingScore(mockScore);

    setTimeout(() => {
      const words = lesson?.content.words || [];
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setRecordingScore(null);
      } else {
        setShowCompletion(true);
      }
    }, 1500);
  };

  const handleConversationSend = () => {
    if (!userInput.trim()) return;

    setConversationMessages([...conversationMessages, { type: 'user', text: userInput }]);
    setUserInput('');

    // Mock AI response
    setTimeout(() => {
      const responses = lang === 'ar'
        ? [
            'ممتاز! أنت تتعلم بسرعة كبيرة.',
            'هذا رد رائع! استمر هكذا.',
            'أحسنت! فهمت الفكرة.',
          ]
        : [
            'Excellent! You are learning very fast.',
            'That is a great response! Keep going.',
            'Great job! You understand the idea.',
          ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setConversationMessages(prev => [...prev, { type: 'ai', text: randomResponse }]);
    }, 800);
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

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <div className="text-white text-center">
          <p className="text-xl font-bold mb-4">{lang === 'ar' ? 'لم يتم العثور على الدرس' : 'Lesson not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary px-6 py-2 rounded-lg"
          >
            {lang === 'ar' ? 'العودة' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  const lessonTitle = lang === 'ar' ? lesson.title_ar : lesson.title_en;
  const progress = lesson.type === 'quiz'
    ? ((currentIndex + 1) / (lesson.content.questions?.length || 1)) * 100
    : ((currentIndex + 1) / (lesson.content.phrases?.length || lesson.content.words?.length || 1)) * 100;

  return (
    <div className={`min-h-screen pb-24 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 animate-slide-up">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className={`text-3xl font-bold text-white flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            {lessonTitle}
          </h1>
        </div>

        {/* Progress bar */}
        {!showCompletion && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{Math.round(progress)}%</span>
              <span>{currentIndex + 1} / {
                lesson.type === 'quiz'
                  ? lesson.content.questions?.length
                  : lesson.type === 'pronunciation'
                  ? lesson.content.words?.length
                  : lesson.content.phrases?.length
              }</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className="glass-card p-8 rounded-2xl animate-fade-in">
          {showCompletion ? (
            // Completion Screen
            <div className="text-center space-y-8 py-12">
              {/* Celebration animation */}
              <div className="relative">
                <div className="inline-block">
                  <div className="text-6xl mb-4 animate-bounce">
                    {lesson.type === 'quiz' ? '🎉' : '✨'}
                  </div>
                  <h2 className="text-4xl font-bold gradient-text mb-4">
                    {t('excellent', lang)}
                  </h2>
                  <p className="text-xl text-slate-300 mb-8">
                    {lang === 'ar'
                      ? 'لقد أكملت الدرس بنجاح!'
                      : 'You have successfully completed the lesson!'}
                  </p>
                </div>
                {/* Confetti-like CSS animation */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full animate-ping"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1.5s',
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">{t('score', lang)}</p>
                  <p className="text-2xl font-bold text-primary-400">{calculateScore()}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">{t('xp', lang)}</p>
                  <p className="text-2xl font-bold text-yellow-400">+{lesson.xp_reward}</p>
                </div>
                {lesson.type === 'quiz' && (
                  <>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">{lang === 'ar' ? 'صحيح' : 'Correct'}</p>
                      <p className="text-2xl font-bold text-green-400">
                        {quizResults.filter(r => r.correct).length}/{quizResults.length}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">{lang === 'ar' ? 'الوقت' : 'Time'}</p>
                      <p className="text-2xl font-bold text-blue-400">{lesson.duration}m</p>
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="btn-primary px-8 py-3 rounded-xl"
                >
                  {lang === 'ar' ? 'العودة للمستوى' : 'Back to Level'}
                </button>
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setShowCompletion(false);
                    setSelectedAnswer(null);
                    setQuizResults([]);
                  }}
                  className="btn-secondary px-8 py-3 rounded-xl"
                >
                  {t('tryAgain', lang)}
                </button>
              </div>
            </div>
          ) : lesson.type === 'lesson' ? (
            // Lesson view - show phrases
            <div className="space-y-8">
              {lesson.content.phrases && lesson.content.phrases[currentIndex] && (
                <div className="space-y-6">
                  {/* English */}
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">{lang === 'ar' ? 'الإنجليزية' : 'English'}</p>
                    <p className="text-3xl font-bold text-white">
                      {lesson.content.phrases[currentIndex].en}
                    </p>
                  </div>

                  {/* Audio button */}
                  <button
                    onClick={() => speakText(lesson.content.phrases[currentIndex].en, 'en-US')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors active:scale-95"
                  >
                    <Volume2 className="w-5 h-5 text-primary-400" />
                    <span className="text-primary-400 font-medium">{t('listen', lang)}</span>
                  </button>

                  {/* Arabic translation */}
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">{lang === 'ar' ? 'الترجمة' : 'Translation'}</p>
                    <p className="text-3xl font-bold text-primary-300">
                      {lesson.content.phrases[currentIndex].ar}
                    </p>
                  </div>

                  {/* Pronunciation */}
                  <div className="space-y-2 bg-white/5 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">{lang === 'ar' ? 'النطق' : 'Pronunciation'}</p>
                    <p className="text-lg font-medium text-slate-300">
                      {lesson.content.phrases[currentIndex].pron}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleLessonPrev}
                  disabled={currentIndex === 0}
                  className="btn-secondary px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                >
                  {t('previous', lang)}
                </button>
                <button
                  onClick={handleLessonNext}
                  className="btn-primary px-6 py-3 rounded-lg flex-1"
                >
                  {currentIndex === (lesson.content.phrases?.length ?? 1) - 1
                    ? t('submit', lang)
                    : t('next', lang)}
                </button>
              </div>
            </div>
          ) : lesson.type === 'quiz' ? (
            // Quiz view
            <div className="space-y-8">
              {lesson.content.questions && lesson.content.questions[currentIndex] && (
                <div className="space-y-6">
                  {/* Question */}
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">{lang === 'ar' ? 'السؤال' : 'Question'}</p>
                    <p className="text-2xl font-bold text-white">
                      {lang === 'ar'
                        ? lesson.content.questions[currentIndex].q_ar
                        : lesson.content.questions[currentIndex].q_en}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lesson.content.questions[currentIndex].options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === lesson.content.questions![currentIndex].answer;
                      const isAnswered = selectedAnswer !== null;

                      let buttonClass = 'glass-card p-4 rounded-lg transition-all border-2 border-transparent hover:border-primary-500/50 cursor-pointer';
                      if (isAnswered) {
                        if (isCorrect) {
                          buttonClass += ' border-green-500/50 bg-green-500/10';
                        } else if (isSelected) {
                          buttonClass += ' border-red-500/50 bg-red-500/10';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => !isAnswered && handleQuizAnswer(idx)}
                          disabled={isAnswered}
                          className={buttonClass}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isAnswered
                                ? isCorrect
                                  ? 'border-green-500 bg-green-500'
                                  : isSelected
                                  ? 'border-red-500 bg-red-500'
                                  : 'border-slate-500'
                                : 'border-slate-500'
                            }`}>
                              {isAnswered && (isCorrect ? (
                                <Check className="w-4 h-4 text-white" />
                              ) : isSelected ? (
                                <X className="w-4 h-4 text-white" />
                              ) : null)}
                            </div>
                            <span className="text-white text-left font-medium">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswer !== null && (
                    <div className={`p-4 rounded-lg ${
                      quizResults[quizResults.length - 1]?.correct
                        ? 'bg-green-500/10 border border-green-500/50 text-green-300'
                        : 'bg-red-500/10 border border-red-500/50 text-red-300'
                    }`}>
                      <p className="font-medium">
                        {quizResults[quizResults.length - 1]?.correct
                          ? t('correct', lang)
                          : t('incorrect', lang)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : lesson.type === 'pronunciation' ? (
            // Pronunciation view
            <div className="space-y-8 text-center">
              {lesson.content.words && lesson.content.words[currentIndex] && (
                <div className="space-y-8">
                  {/* Word display */}
                  <div className="space-y-4">
                    <p className="text-lg text-slate-400">{lang === 'ar' ? 'كلمة اليوم' : 'Word of the Day'}</p>
                    <p className="text-6xl font-bold text-primary-300">
                      {lesson.content.words[currentIndex].word}
                    </p>
                    <p className="text-2xl text-slate-300">
                      {lesson.content.words[currentIndex].ar}
                    </p>
                  </div>

                  {/* Record button */}
                  {recordingScore === null ? (
                    <button
                      onClick={handlePronunciationRecord}
                      className="btn-primary px-8 py-4 rounded-xl mx-auto text-lg inline-flex items-center gap-2"
                    >
                      {t('record', lang)}
                    </button>
                  ) : (
                    <div className="space-y-4 bg-white/5 p-6 rounded-lg">
                      <p className="text-lg text-slate-300">{lang === 'ar' ? 'درجتك' : 'Your Score'}</p>
                      <p className="text-5xl font-bold text-green-400">{recordingScore}%</p>
                      <p className="text-sm text-slate-400">
                        {recordingScore >= 80
                          ? lang === 'ar'
                            ? 'أحسنت! نطقك ممتاز'
                            : 'Great! Your pronunciation is excellent'
                          : lang === 'ar'
                          ? 'جيد! استمر في التدريب'
                          : 'Good! Keep practicing'}
                      </p>
                    </div>
                  )}

                  {/* Navigation */}
                  {recordingScore !== null && (
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => {
                          const words = lesson.content.words || [];
                          if (currentIndex < words.length - 1) {
                            setCurrentIndex(currentIndex + 1);
                            setRecordingScore(null);
                          } else {
                            setShowCompletion(true);
                          }
                        }}
                        className="btn-primary px-8 py-3 rounded-lg flex-1"
                      >
                        {currentIndex === (lesson.content.words?.length ?? 1) - 1
                          ? t('submit', lang)
                          : t('next', lang)}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : lesson.type === 'conversation' ? (
            // Conversation view
            <div className="space-y-6 h-96 flex flex-col">
              {/* Scenario */}
              {lesson.content.scenario && (
                <div className="bg-white/5 p-4 rounded-lg mb-4">
                  <p className="text-sm text-slate-400 mb-2">{lang === 'ar' ? 'السيناريو' : 'Scenario'}</p>
                  <p className="text-white">
                    {lang === 'ar'
                      ? lesson.content.scenario.text_ar
                      : lesson.content.scenario.text_en}
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {conversationMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/10 text-slate-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleConversationSend()}
                  placeholder={lang === 'ar' ? 'اكتب ردك...' : 'Type your response...'}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400"
                />
                <button
                  onClick={handleConversationSend}
                  className="btn-primary px-6 py-2 rounded-lg"
                >
                  {t('submit', lang)}
                </button>
              </div>

              {/* End lesson button */}
              {conversationMessages.length >= 4 && (
                <button
                  onClick={() => {
                    setShowCompletion(true);
                  }}
                  className="btn-secondary w-full py-2 rounded-lg mt-4"
                >
                  {lang === 'ar' ? 'إنهاء الدرس' : 'End Lesson'}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

    </div>
  );
}
