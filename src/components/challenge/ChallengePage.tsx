import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Mic, Check, Flame } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';

interface Word {
  en: string;
  ar: string;
}

interface Sentence {
  en: string;
  ar: string;
}

interface DailyChallenge {
  id: string;
  challenge_date: string;
  words: Word[];
  sentences: Sentence[];
  speaking_prompt_en: string;
  speaking_prompt_ar: string;
}

interface UserChallenge {
  user_id: string;
  challenge_id: string;
  words_completed: boolean;
  sentences_completed: boolean;
  speaking_completed: boolean;
  xp_earned: number;
  completed_at: string;
}

const MOCK_WORDS: Word[] = [
  { en: 'Reservation', ar: 'حجز' },
  { en: 'Delicious', ar: 'لذيذ' },
  { en: 'Appointment', ar: 'موعد' },
  { en: 'Comfortable', ar: 'مريح' },
  { en: 'Important', ar: 'مهم' },
];

const MOCK_SENTENCES: Sentence[] = [
  { en: 'I would like to make a reservation.', ar: 'أريد إجراء حجز.' },
  { en: 'The food was absolutely delicious.', ar: 'الطعام كان لذيذا جدا.' },
  { en: 'This is very important for me.', ar: 'هذا مهم جدا بالنسبة لي.' },
];

const MOCK_CHALLENGE: DailyChallenge = {
  id: 'challenge-' + new Date().toISOString().split('T')[0],
  challenge_date: new Date().toISOString().split('T')[0],
  words: MOCK_WORDS,
  sentences: MOCK_SENTENCES,
  speaking_prompt_en: 'Introduce yourself in English. Tell us your name, where you are from, and what you do.',
  speaking_prompt_ar: 'عرّف عن نفسك باللغة الإنجليزية. أخبرنا باسمك وأين أنت من وما تفعله.',
};

export default function ChallengePage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { lang, isRTL } = useLanguage();

  const [challenge, setChallenge] = useState<DailyChallenge>(MOCK_CHALLENGE);
  const [userChallenge, setUserChallenge] = useState<UserChallenge | null>(null);
  const [wordsCompleted, setWordsCompleted] = useState(false);
  const [sentencesCompleted, setSentencesCompleted] = useState(false);
  const [speakingCompleted, setSpeakingCompleted] = useState(false);
  const [flippedWords, setFlippedWords] = useState<Set<number>>(new Set());
  const [recordingScore, setRecordingScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];

        // Check if challenge exists for today
        const { data: existingChallenge } = await supabase
          .from('daily_challenges')
          .select('*')
          .eq('challenge_date', today)
          .maybeSingle();

        if (existingChallenge) {
          setChallenge(existingChallenge);
        }

        // Check if user completed today's challenge
        const { data: existingUserChallenge } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('challenge_id', existingChallenge?.id || MOCK_CHALLENGE.id)
          .maybeSingle();

        if (existingUserChallenge) {
          setUserChallenge(existingUserChallenge);
          setWordsCompleted(existingUserChallenge.words_completed);
          setSentencesCompleted(existingUserChallenge.sentences_completed);
          setSpeakingCompleted(existingUserChallenge.speaking_completed);
        }
      } catch (error) {
        console.error('Error fetching challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [user]);

  const toggleWordFlip = (index: number) => {
    setFlippedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleWordsComplete = async () => {
    if (!user || !profile) return;

    try {
      const challengeId = challenge.id;

      // Create challenge if it doesn't exist
      let { data: existingChallenge } = await supabase
        .from('daily_challenges')
        .select('id')
        .eq('id', challengeId)
        .maybeSingle();

      if (!existingChallenge) {
        await supabase.from('daily_challenges').insert({
          id: challengeId,
          challenge_date: challenge.challenge_date,
          words: challenge.words,
          sentences: challenge.sentences,
          speaking_prompt_en: challenge.speaking_prompt_en,
          speaking_prompt_ar: challenge.speaking_prompt_ar,
        });
      }

      setWordsCompleted(true);
      checkAndSaveCompletion(true, sentencesCompleted, speakingCompleted, challengeId);
    } catch (error) {
      console.error('Error marking words as complete:', error);
    }
  };

  const handleSentencesComplete = async () => {
    if (!user || !profile) return;

    try {
      const challengeId = challenge.id;

      // Create challenge if it doesn't exist
      let { data: existingChallenge } = await supabase
        .from('daily_challenges')
        .select('id')
        .eq('id', challengeId)
        .maybeSingle();

      if (!existingChallenge) {
        await supabase.from('daily_challenges').insert({
          id: challengeId,
          challenge_date: challenge.challenge_date,
          words: challenge.words,
          sentences: challenge.sentences,
          speaking_prompt_en: challenge.speaking_prompt_en,
          speaking_prompt_ar: challenge.speaking_prompt_ar,
        });
      }

      setSentencesCompleted(true);
      checkAndSaveCompletion(wordsCompleted, true, speakingCompleted, challengeId);
    } catch (error) {
      console.error('Error marking sentences as complete:', error);
    }
  };

  const handleSpeakingComplete = async () => {
    // Mock recording - automatically generate score between 75-95
    const mockScore = Math.floor(Math.random() * (95 - 75 + 1)) + 75;
    setRecordingScore(mockScore);

    setTimeout(async () => {
      if (!user || !profile) return;

      try {
        const challengeId = challenge.id;

        // Create challenge if it doesn't exist
        let { data: existingChallenge } = await supabase
          .from('daily_challenges')
          .select('id')
          .eq('id', challengeId)
          .maybeSingle();

        if (!existingChallenge) {
          await supabase.from('daily_challenges').insert({
            id: challengeId,
            challenge_date: challenge.challenge_date,
            words: challenge.words,
            sentences: challenge.sentences,
            speaking_prompt_en: challenge.speaking_prompt_en,
            speaking_prompt_ar: challenge.speaking_prompt_ar,
          });
        }

        setSpeakingCompleted(true);
        checkAndSaveCompletion(wordsCompleted, sentencesCompleted, true, challengeId);
      } catch (error) {
        console.error('Error marking speaking as complete:', error);
      }
    }, 1500);
  };

  const checkAndSaveCompletion = async (words: boolean, sentences: boolean, speaking: boolean, challengeId: string) => {
    if (words && sentences && speaking && user && profile) {
      // All sections completed
      const xpEarned = 100;

      try {
        await supabase.from('user_challenges').upsert({
          user_id: user.id,
          challenge_id: challengeId,
          words_completed: words,
          sentences_completed: sentences,
          speaking_completed: speaking,
          xp_earned: xpEarned,
          completed_at: new Date().toISOString(),
        });

        await updateProfile({
          total_xp: profile.total_xp + xpEarned,
        } as any);

        setUserChallenge({
          user_id: user.id,
          challenge_id: challengeId,
          words_completed: words,
          sentences_completed: sentences,
          speaking_completed: speaking,
          xp_earned: xpEarned,
          completed_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving challenge completion:', error);
      }
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

  const progressCount = (wordsCompleted ? 1 : 0) + (sentencesCompleted ? 1 : 0) + (speakingCompleted ? 1 : 0);
  const progressPercent = (progressCount / 3) * 100;
  const isAllCompleted = wordsCompleted && sentencesCompleted && speakingCompleted;

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
          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Flame className="w-8 h-8 text-orange-400" />
              {lang === 'ar' ? 'التحدي اليومي' : 'Daily Challenge'}
            </h1>
          </div>
        </div>

        {userChallenge && isAllCompleted ? (
          // Completion screen
          <div className="glass-card p-8 rounded-2xl text-center space-y-8 animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-4xl font-bold gradient-text">
              {lang === 'ar' ? 'رائع جدا!' : 'Awesome!'}
            </h2>
            <p className="text-xl text-slate-300">
              {lang === 'ar'
                ? 'لقد أكملت التحدي اليومي بنجاح!'
                : 'You have successfully completed the daily challenge!'}
            </p>
            <div className="bg-white/5 rounded-lg p-6">
              <p className="text-slate-400 text-sm mb-2">
                {lang === 'ar' ? 'النقاط المكتسبة' : 'Points Earned'}
              </p>
              <p className="text-5xl font-bold text-yellow-400">+100 XP</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="btn-primary px-8 py-3 rounded-xl"
            >
              {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{progressCount}/3 {lang === 'ar' ? 'مكتملة' : 'Completed'}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Section 1: Words */}
            <div
              className={`glass-card p-6 rounded-2xl animate-fade-in ${
                wordsCompleted ? 'border border-green-500/50 bg-green-500/5' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? '5 كلمات' : '5 Words'}
                </h2>
                {wordsCompleted && <Check className="w-6 h-6 text-green-400" />}
              </div>

              {!wordsCompleted ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {challenge.words.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleWordFlip(idx)}
                        className="glass-light p-6 rounded-xl text-center h-32 flex items-center justify-center cursor-pointer transform transition-transform hover:scale-105 perspective"
                      >
                        <div>
                          <p className="text-sm text-slate-400 mb-2">
                            {flippedWords.has(idx)
                              ? lang === 'ar'
                                ? 'الترجمة'
                                : 'Translation'
                              : lang === 'ar'
                              ? 'كلمة'
                              : 'Word'}
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {flippedWords.has(idx) ? word.ar : word.en}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleWordsComplete}
                    className="btn-primary w-full py-3 rounded-xl"
                  >
                    {lang === 'ar' ? 'تم التعلم' : 'Mark as Done'}
                  </button>
                </>
              ) : (
                <p className="text-green-300 text-center py-6">
                  {lang === 'ar' ? 'تم الانتهاء من الكلمات!' : 'Words section completed!'}
                </p>
              )}
            </div>

            {/* Section 2: Sentences */}
            <div
              className={`glass-card p-6 rounded-2xl animate-fade-in ${
                sentencesCompleted ? 'border border-green-500/50 bg-green-500/5' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? '3 جمل' : '3 Sentences'}
                </h2>
                {sentencesCompleted && <Check className="w-6 h-6 text-green-400" />}
              </div>

              {!sentencesCompleted ? (
                <>
                  <div className="space-y-4 mb-6">
                    {challenge.sentences.map((sentence, idx) => (
                      <div
                        key={idx}
                        className="glass-light p-4 rounded-xl space-y-3"
                      >
                        <p className="text-white font-medium">
                          {lang === 'ar' ? sentence.ar : sentence.en}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {lang === 'ar' ? sentence.en : sentence.ar}
                        </p>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors">
                          <Volume2 className="w-4 h-4 text-primary-400" />
                          <span className="text-sm text-primary-400">
                            {lang === 'ar' ? 'استمع' : 'Listen'}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSentencesComplete}
                    className="btn-primary w-full py-3 rounded-xl"
                  >
                    {lang === 'ar' ? 'تم التعلم' : 'Mark as Done'}
                  </button>
                </>
              ) : (
                <p className="text-green-300 text-center py-6">
                  {lang === 'ar' ? 'تم الانتهاء من الجمل!' : 'Sentences section completed!'}
                </p>
              )}
            </div>

            {/* Section 3: Speaking Task */}
            <div
              className={`glass-card p-6 rounded-2xl animate-fade-in ${
                speakingCompleted ? 'border border-green-500/50 bg-green-500/5' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? 'مهمة نطق واحدة' : '1 Speaking Task'}
                </h2>
                {speakingCompleted && <Check className="w-6 h-6 text-green-400" />}
              </div>

              {!speakingCompleted ? (
                <>
                  <div className="bg-white/5 p-6 rounded-lg mb-6">
                    <p className={`text-slate-400 text-sm mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {lang === 'ar' ? 'المهمة' : 'Task'}
                    </p>
                    <p className={`text-white text-lg leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                      {lang === 'ar'
                        ? challenge.speaking_prompt_ar
                        : challenge.speaking_prompt_en}
                    </p>
                  </div>

                  {recordingScore === null ? (
                    <button
                      onClick={handleSpeakingComplete}
                      className="btn-primary w-full py-4 rounded-xl text-lg inline-flex items-center justify-center gap-2"
                    >
                      <Mic className="w-5 h-5" />
                      {lang === 'ar' ? 'سجل الآن' : 'Record Now'}
                    </button>
                  ) : (
                    <div className="space-y-4 bg-white/5 p-6 rounded-lg">
                      <p className="text-center text-lg text-slate-300">
                        {lang === 'ar' ? 'درجتك' : 'Your Score'}
                      </p>
                      <p className="text-5xl font-bold text-green-400 text-center">
                        {recordingScore}%
                      </p>
                      <p className="text-sm text-slate-400 text-center">
                        {recordingScore >= 80
                          ? lang === 'ar'
                            ? 'أحسنت! نطقك ممتاز'
                            : 'Great! Your pronunciation is excellent'
                          : lang === 'ar'
                          ? 'جيد! استمر في التدريب'
                          : 'Good! Keep practicing'}
                      </p>
                      <button
                        onClick={handleSpeakingComplete}
                        className="btn-secondary w-full py-3 rounded-xl mt-4"
                      >
                        {lang === 'ar' ? 'تم' : 'Done'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-green-300 text-center py-6">
                  {lang === 'ar' ? 'تم الانتهاء من المهمة!' : 'Speaking task completed!'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
