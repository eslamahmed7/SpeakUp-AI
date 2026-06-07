import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Mic } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';

interface Sentence {
  en: string;
  ar: string;
}

interface PhaseScore {
  timing: number;
  pronunciation: number;
  fluency: number;
}

type Phase = 'listen' | 'repeat' | 'compare';

const SENTENCES: Sentence[] = [
  { en: 'Hello, how are you today?', ar: 'مرحبا، كيف حالك اليوم؟' },
  { en: 'I would like a cup of coffee, please.', ar: 'أريد كوبا من القهوة من فضلك.' },
  { en: 'Where is the nearest hotel?', ar: 'أين أقرب فندق؟' },
  { en: 'Thank you very much for your help.', ar: 'شكرا جزيلا على مساعدتك.' },
  { en: 'I am looking forward to meeting you.', ar: 'أنا أتطلع إلى مقابلتك.' },
];

export default function ShadowingPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { lang, isRTL } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>('listen');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [phaseScores, setPhaseScores] = useState<PhaseScore[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentSentence = SENTENCES[currentIndex];

  const generateMockScore = () => {
    return Math.floor(Math.random() * (95 - 60 + 1)) + 60;
  };

  const handleListen = () => {
    setIsAudioPlaying(true);
    // Mock audio playback
    setTimeout(() => {
      setIsAudioPlaying(false);
      setCurrentPhase('repeat');
    }, 3000);
  };

  const handleRecord = () => {
    setIsRecording(true);
    // Mock recording
    setTimeout(() => {
      setIsRecording(false);
      setCurrentPhase('compare');
    }, 3000);
  };

  const handleCompareNext = () => {
    // Generate mock scores
    const newScores: PhaseScore = {
      timing: generateMockScore(),
      pronunciation: generateMockScore(),
      fluency: generateMockScore(),
    };

    setPhaseScores([...phaseScores, newScores]);

    if (currentIndex < SENTENCES.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentPhase('listen');
    } else {
      // Completion
      const avgScore = Math.round(
        phaseScores.reduce((acc, s) => acc + (s.timing + s.pronunciation + s.fluency) / 3, 0) /
          phaseScores.length +
          (newScores.timing + newScores.pronunciation + newScores.fluency) / 3 / phaseScores.length
      );

      setFinalScore(avgScore);
      saveResults(avgScore);
    }
  };

  const saveResults = async (score: number) => {
    try {
      await supabase.from('conversations').insert({
        type: 'shadowing',
        score: score,
        duration_seconds: 180,
        user_id: user?.id,
        metadata: { phase_scores: phaseScores }
      });

      if (profile) {
        await updateProfile({
          total_xp: (profile.total_xp || 0) + 25
        } as any);
      }
    } catch (error) {
      console.error('Error saving shadowing results:', error);
    }

    setShowCompletion(true);
  };

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'listen':
        return lang === 'ar' ? 'استمع' : 'Listen';
      case 'repeat':
        return lang === 'ar' ? 'كرر' : 'Repeat';
      case 'compare':
        return lang === 'ar' ? 'قارن' : 'Compare';
    }
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
              {lang === 'ar' ? 'وضع التكرار' : 'Shadow Mode'}
            </h1>
          </div>

          <div className="glass-card p-8 rounded-2xl animate-fade-in text-center space-y-8 py-12">
            <div className="relative">
              <div className="inline-block">
                <div className="text-6xl mb-4 animate-bounce">🌟</div>
                <h2 className="text-4xl font-bold gradient-text mb-4">
                  {t('excellent', lang)}
                </h2>
                <p className="text-xl text-slate-300 mb-8">
                  {lang === 'ar'
                    ? 'أكملت وضع التكرار!'
                    : 'You completed Shadow Mode!'}
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
                      stroke={finalScore >= 80 ? '#10b981' : finalScore >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      strokeDasharray={`${(finalScore / 100) * 282.7} 282.7`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 1s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className={`text-5xl font-bold ${finalScore >= 80 ? 'text-green-400' : finalScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {finalScore}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">
                    {lang === 'ar' ? 'جمل' : 'Sentences'}
                  </p>
                  <p className="text-2xl font-bold text-primary-400">{SENTENCES.length}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">{t('xp', lang)}</p>
                  <p className="text-2xl font-bold text-yellow-400">+25</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">
                    {lang === 'ar' ? 'التقييم' : 'Rating'}
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {finalScore >= 80 ? 'A' : finalScore >= 60 ? 'B' : 'C'}
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
                  setCurrentPhase('listen');
                  setPhaseScores([]);
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
            {lang === 'ar' ? 'وضع التكرار' : 'Shadow Mode'}
          </h1>
        </div>

        {/* Progress */}
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>{Math.round(((currentIndex + 1) / SENTENCES.length) * 100)}%</span>
            <span>{currentIndex + 1} / {SENTENCES.length}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / SENTENCES.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="glass-card p-4 rounded-xl animate-fade-in">
          <div className="flex gap-3 justify-center">
            {(['listen', 'repeat', 'compare'] as const).map((phase, idx) => (
              <div
                key={phase}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentPhase === phase
                    ? 'bg-primary-500 text-white'
                    : phaseScores.length > idx
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-white/5 text-slate-400'
                }`}
              >
                {phase === 'listen' && (lang === 'ar' ? 'استمع' : 'Listen')}
                {phase === 'repeat' && (lang === 'ar' ? 'كرر' : 'Repeat')}
                {phase === 'compare' && (lang === 'ar' ? 'قارن' : 'Compare')}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="glass-card p-8 rounded-2xl animate-fade-in space-y-8">
          {/* Sentence Display */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-slate-400 text-lg">
                {getPhaseTitle()}
              </p>
              <p className="text-4xl font-bold text-white">
                {currentSentence.en}
              </p>
              <p className="text-xl text-primary-300">
                {currentSentence.ar}
              </p>
            </div>
          </div>

          {/* Phase Content */}
          {currentPhase === 'listen' && (
            <div className="space-y-8 py-8">
              <p className="text-center text-slate-300">
                {lang === 'ar'
                  ? 'استمع إلى الجملة بعناية'
                  : 'Listen to the sentence carefully'}
              </p>

              <button
                onClick={handleListen}
                disabled={isAudioPlaying}
                className={`w-full py-6 rounded-xl font-medium transition-all flex items-center justify-center gap-3 ${
                  isAudioPlaying
                    ? 'bg-primary-500/30 border border-primary-500/50 text-primary-300'
                    : 'btn-primary'
                }`}
              >
                <Volume2 className={`w-6 h-6 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
                {isAudioPlaying
                  ? lang === 'ar' ? 'جاري التشغيل...' : 'Playing...'
                  : t('listen', lang)
                }
              </button>

              {isAudioPlaying && (
                <div className="flex justify-center gap-1">
                  <div className="w-1 h-8 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-12 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-10 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <div className="w-1 h-12 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  <div className="w-1 h-8 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                </div>
              )}
            </div>
          )}

          {currentPhase === 'repeat' && (
            <div className="space-y-8 py-8">
              <p className="text-center text-slate-300">
                {lang === 'ar'
                  ? 'سجل نفسك وأنت تكرر الجملة'
                  : 'Record yourself repeating the sentence'}
              </p>

              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={handleRecord}
                  disabled={isRecording}
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
            </div>
          )}

          {currentPhase === 'compare' && phaseScores.length > currentIndex && (
            <div className="space-y-8 py-8">
              <p className="text-center text-slate-300 mb-6">
                {lang === 'ar'
                  ? 'النتائج'
                  : 'Results'}
              </p>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm mb-2">
                    {lang === 'ar' ? 'التوقيت' : 'Timing'}
                  </p>
                  <p className="text-3xl font-bold text-blue-400">
                    {phaseScores[currentIndex].timing}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm mb-2">
                    {lang === 'ar' ? 'النطق' : 'Pronunciation'}
                  </p>
                  <p className="text-3xl font-bold text-purple-400">
                    {phaseScores[currentIndex].pronunciation}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm mb-2">
                    {lang === 'ar' ? 'الطلاقة' : 'Fluency'}
                  </p>
                  <p className="text-3xl font-bold text-green-400">
                    {phaseScores[currentIndex].fluency}%
                  </p>
                </div>
              </div>

              {/* Overall Score */}
              <div className="bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/50 rounded-xl p-6 text-center">
                <p className="text-slate-400 mb-3">
                  {lang === 'ar' ? 'متوسط النقاط' : 'Average Score'}
                </p>
                <p className="text-5xl font-bold gradient-text">
                  {Math.round(
                    (phaseScores[currentIndex].timing +
                      phaseScores[currentIndex].pronunciation +
                      phaseScores[currentIndex].fluency) /
                      3
                  )}%
                </p>
              </div>

              {/* Next Button */}
              <button
                onClick={handleCompareNext}
                className="btn-primary w-full py-4 rounded-xl text-lg font-medium"
              >
                {currentIndex === SENTENCES.length - 1
                  ? lang === 'ar' ? 'إنهاء' : 'Finish'
                  : t('next', lang)
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
