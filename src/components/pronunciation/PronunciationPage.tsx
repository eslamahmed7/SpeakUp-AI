import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Mic } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { evaluatePronunciationScore } from '../../lib/ai';
import { startListening, stopListening, speakText } from '../../lib/speech';

interface Word {
  en: string;
  ar: string;
  pron: string;
}

interface RecordingResult {
  score: number;
  problems: string[];
}

const WORDS: Word[] = [
  { en: 'Hello', ar: 'مرحبا', pron: 'hə-ˈlō' },
  { en: 'Thank you', ar: 'شكراً', pron: 'ˈθaŋk yü' },
  { en: 'Good morning', ar: 'صباح الخير', pron: 'ˌgu̇d ˈmȯr-niŋ' },
  { en: 'How are you', ar: 'كيف حالك', pron: 'ˈhau̇ är ˈyü' },
  { en: 'Nice to meet you', ar: 'يسعدني التعرف عليك', pron: 'ˌnīs tü ˈmēt yü' },
  { en: 'Where is', ar: 'أين', pron: 'ˈhwer ˈiz' },
  { en: 'I would like', ar: 'أود أن', pron: 'ˌī ˈwu̇d ˈlīk' },
  { en: 'Excuse me', ar: 'اعتذر', pron: 'ik-ˈskyu̇z ˈmē' },
  { en: 'Goodbye', ar: 'وداعاً', pron: 'ˌgu̇d-ˈbī' },
  { en: 'Please', ar: 'من فضلك', pron: 'ˈplēz' },
];

export default function PronunciationPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { lang, isRTL } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);

  const currentWord = WORDS[currentIndex];

  useEffect(() => {
    return () => stopListening();
  }, []);

  const handleListen = () => {
    speakText(currentWord.en, 'en-US');
  };

  const handleRecord = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setRecordingResult(null);
      startListening(
        (text, isFinal) => {
          if (isFinal) {
            stopListening();
            setIsRecording(false);
            
            const score = evaluatePronunciationScore(text, currentWord.en);
            
            let problems: string[] = [];
            if (score < 80) {
               problems.push(lang === 'ar' ? `سمعتك تقول: "${text}"` : `I heard: "${text}"`);
               problems.push(lang === 'ar' ? 'تأكد من مخارج الحروف' : 'Check your articulation');
            }

            setRecordingResult({ score, problems });
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

  const handleNext = async () => {
    if (currentIndex < WORDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRecordingResult(null);
    } else {
      // Completion
      const avgScore = recordingResult?.score || 100;

      try {
        await supabase.from('conversations').insert({
          type: 'pronunciation',
          score: avgScore,
          duration_seconds: 120,
          user_id: user?.id
        });

        if (profile) {
          await updateProfile({
            total_xp: (profile.total_xp || 0) + 15
          } as any);
        }
      } catch (error) {
        console.error('Error saving pronunciation practice:', error);
      }

      setCompletionScore(avgScore);
      setShowCompletion(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-green-600/10';
    if (score >= 60) return 'from-yellow-500/20 to-yellow-600/10';
    return 'from-red-500/20 to-red-600/10';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-500/50';
    if (score >= 60) return 'border-yellow-500/50';
    return 'border-red-500/50';
  };

  if (showCompletion) {
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
              {t('pronunciation', lang)}
            </h1>
          </div>

          <div className="glass-card p-8 rounded-2xl animate-fade-in text-center space-y-8 py-12">
            <div className="relative">
              <div className="inline-block">
                <div className="text-6xl mb-4 animate-bounce">🎯</div>
                <h2 className="text-4xl font-bold gradient-text mb-4">
                  {t('excellent', lang)}
                </h2>
                <p className="text-xl text-slate-300 mb-8">
                  {lang === 'ar'
                    ? 'أكملت تدريب النطق!'
                    : 'You completed the pronunciation practice!'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Circular Score Display */}
              <div className="flex justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(108, 99, 255, 0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={completionScore >= 80 ? '#10b981' : completionScore >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      strokeDasharray={`${(completionScore / 100) * 282.7} 282.7`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 1s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className={`text-5xl font-bold ${getScoreColor(completionScore)}`}>
                      {completionScore}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">{lang === 'ar' ? 'كلمات' : 'Words'}</p>
                  <p className="text-2xl font-bold text-primary-400">{WORDS.length}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">{t('xp', lang)}</p>
                  <p className="text-2xl font-bold text-yellow-400">+15</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">{lang === 'ar' ? 'المستوى' : 'Level'}</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {completionScore >= 80 ? 'A' : completionScore >= 60 ? 'B' : 'C'}
                  </p>
                </div>
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
                  setCurrentIndex(0);
                  setRecordingResult(null);
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
    <div className={`min-h-screen pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 animate-slide-up">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className={`text-3xl font-bold text-white flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('pronunciation', lang)}
          </h1>
        </div>

        {/* Progress */}
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>{Math.round(((currentIndex + 1) / WORDS.length) * 100)}%</span>
            <span>{currentIndex + 1} / {WORDS.length}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / WORDS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="glass-card p-8 rounded-2xl animate-fade-in space-y-8">
          {/* Word Display */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-slate-400 text-lg">
                {lang === 'ar' ? 'الكلمة' : 'Word'}
              </p>
              <p className="text-6xl font-bold text-white">
                {currentWord.en}
              </p>
              <p className="text-2xl text-primary-300">
                {currentWord.ar}
              </p>
            </div>

            {/* Pronunciation Guide */}
            <div className="glass-light p-6 rounded-xl space-y-2">
              <p className="text-sm text-slate-400">
                {lang === 'ar' ? 'دليل النطق' : 'Pronunciation Guide'}
              </p>
              <p className="text-xl font-medium text-slate-300">
                / {currentWord.pron} /
              </p>
            </div>

            {/* Listen Button */}
            <button 
              onClick={handleListen}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors"
            >
              <Volume2 className="w-5 h-5 text-primary-400" />
              <span className="text-primary-400 font-medium">{t('listen', lang)}</span>
            </button>
          </div>

          {/* Recording Section */}
          {!recordingResult ? (
            <div className="flex flex-col items-center gap-6 py-8">
              <p className="text-slate-400 text-lg">
                {lang === 'ar' ? 'سجل نطقك' : 'Record Your Pronunciation'}
              </p>

              <button
                onClick={handleRecord}
                className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse shadow-lg shadow-red-500/50'
                    : 'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 shadow-lg shadow-primary-500/50 hover:shadow-primary-600/70'
                }`}
              >
                <Mic className={`w-12 h-12 text-white ${isRecording ? 'animate-bounce' : ''}`} />
              </button>

              {isRecording && (
                <div className="flex gap-1">
                  <div className="w-1 h-8 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-12 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-10 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <div className="w-1 h-8 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 py-8">
              {/* Score Result */}
              <div className={`rounded-2xl p-8 bg-gradient-to-r ${getScoreBgColor(recordingResult.score)} border ${getScoreBorderColor(recordingResult.score)}`}>
                <div className="flex justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(108, 99, 255, 0.1)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={recordingResult.score >= 80 ? '#10b981' : recordingResult.score >= 60 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="6"
                        strokeDasharray={`${(recordingResult.score / 100) * 282.7} 282.7`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className={`text-4xl font-bold ${getScoreColor(recordingResult.score)}`}>
                        {recordingResult.score}%
                      </p>
                    </div>
                  </div>
                </div>

                {recordingResult.problems.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <p className="text-slate-300 font-medium text-center">
                      {lang === 'ar' ? 'نقاط التحسن' : 'Areas to Improve'}
                    </p>
                    {recordingResult.problems.map((problem, idx) => (
                      <div
                        key={idx}
                        className="bg-white/10 rounded-lg p-3 text-slate-200 text-sm flex items-center gap-2"
                      >
                        <span className="text-lg">🎯</span>
                        {problem}
                      </div>
                    ))}
                  </div>
                )}

                {recordingResult.problems.length === 0 && (
                  <div className="mt-8 text-center">
                    <p className="text-green-300 font-medium text-lg">
                      {lang === 'ar' ? '🎉 نطق مثالي!' : '🎉 Perfect Pronunciation!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                {currentIndex > 0 && (
                  <button
                    onClick={() => {
                      setCurrentIndex(currentIndex - 1);
                      setRecordingResult(null);
                    }}
                    className="btn-secondary px-6 py-3 rounded-lg flex-1"
                  >
                    {t('previous', lang)}
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="btn-primary px-6 py-3 rounded-lg flex-1"
                >
                  {currentIndex === WORDS.length - 1 ? t('submit', lang) : t('next', lang)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
