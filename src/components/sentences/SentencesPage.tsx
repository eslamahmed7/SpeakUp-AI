import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Volume2Icon, BarChart3Icon } from 'lucide-react';

interface Sentence {
  id: string;
  sentence_en: string;
  sentence_ar: string;
  pronunciation: string;
  category: string;
  difficulty: number;
}

interface UserSentence {
  sentence_id: string;
  learned: boolean;
  review_count: number;
  last_reviewed_at: string;
}

const CATEGORIES = [
  { key: 'all', label: t('all', 'en') },
  { key: 'food', label: t('food', 'en') },
  { key: 'travel', label: t('travel', 'en') },
  { key: 'business', label: t('business', 'en') },
  { key: 'dailyLife', label: t('dailyLife', 'en') },
  { key: 'restaurant', label: t('restaurant', 'en') },
  { key: 'shopping', label: t('shopping', 'en') },
  { key: 'airport', label: t('airport', 'en') },
  { key: 'hotel', label: t('hotel', 'en') },
  { key: 'family', label: t('family', 'en') },
  { key: 'technology', label: t('technology', 'en') },
];

const FALLBACK_SENTENCES: Sentence[] = [
  {
    id: '1',
    sentence_en: 'How are you doing today?',
    sentence_ar: 'كيف حالك اليوم؟',
    pronunciation: 'How are you doing today?',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    id: '2',
    sentence_en: 'Could you recommend a good restaurant?',
    sentence_ar: 'هل يمكنك أن توصي بمطعم جيد؟',
    pronunciation: 'Could you recommend a good restaurant?',
    category: 'restaurant',
    difficulty: 2,
  },
  {
    id: '3',
    sentence_en: 'What time does the flight depart?',
    sentence_ar: 'في أي وقت تغادر الرحلة؟',
    pronunciation: 'What time does the flight depart?',
    category: 'travel',
    difficulty: 2,
  },
  {
    id: '4',
    sentence_en: 'I would like to book a table for four people.',
    sentence_ar: 'أود حجز طاولة لأربعة أشخاص.',
    pronunciation: 'I would like to book a table for four people.',
    category: 'restaurant',
    difficulty: 2,
  },
  {
    id: '5',
    sentence_en: 'Where is the nearest bus station?',
    sentence_ar: 'أين أقرب محطة حافلات؟',
    pronunciation: 'Where is the nearest bus station?',
    category: 'travel',
    difficulty: 2,
  },
  {
    id: '6',
    sentence_en: 'Can I get some water, please?',
    sentence_ar: 'هل يمكنني الحصول على بعض الماء من فضلك؟',
    pronunciation: 'Can I get some water, please?',
    category: 'restaurant',
    difficulty: 1,
  },
  {
    id: '7',
    sentence_en: 'The meeting is scheduled for tomorrow at 10 AM.',
    sentence_ar: 'الاجتماع مقرر غداً الساعة العاشرة صباحاً.',
    pronunciation: 'The meeting is scheduled for tomorrow at 10 AM.',
    category: 'business',
    difficulty: 2,
  },
  {
    id: '8',
    sentence_en: 'I need to renew my passport before my trip.',
    sentence_ar: 'أحتاج إلى تجديد جواز سفري قبل رحلتي.',
    pronunciation: 'I need to renew my passport before my trip.',
    category: 'travel',
    difficulty: 3,
  },
  {
    id: '9',
    sentence_en: 'Could you help me find my hotel?',
    sentence_ar: 'هل يمكنك مساعدتي في العثور على فندقي؟',
    pronunciation: 'Could you help me find my hotel?',
    category: 'hotel',
    difficulty: 2,
  },
  {
    id: '10',
    sentence_en: 'What is your name?',
    sentence_ar: 'ما اسمك؟',
    pronunciation: 'What is your name?',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    id: '11',
    sentence_en: 'This product is on sale today.',
    sentence_ar: 'هذا المنتج في التخفيض اليوم.',
    pronunciation: 'This product is on sale today.',
    category: 'shopping',
    difficulty: 2,
  },
  {
    id: '12',
    sentence_en: 'How much does this cost?',
    sentence_ar: 'كم يكلف هذا؟',
    pronunciation: 'How much does this cost?',
    category: 'shopping',
    difficulty: 1,
  },
  {
    id: '13',
    sentence_en: 'I would like to check in, please.',
    sentence_ar: 'أود تسجيل الوصول من فضلك.',
    pronunciation: 'I would like to check in, please.',
    category: 'hotel',
    difficulty: 2,
  },
  {
    id: '14',
    sentence_en: 'My brother works in the technology industry.',
    sentence_ar: 'أخي يعمل في صناعة التكنولوجيا.',
    pronunciation: 'My brother works in the technology industry.',
    category: 'family',
    difficulty: 2,
  },
  {
    id: '15',
    sentence_en: 'Could you please speak more slowly?',
    sentence_ar: 'هل يمكنك التحدث أبطأ من فضلك؟',
    pronunciation: 'Could you please speak more slowly?',
    category: 'daily_life',
    difficulty: 2,
  },
];

function SentenceCard({
  sentence,
  isLearned,
  onLearnToggle,
  lang,
}: {
  sentence: Sentence;
  isLearned: boolean;
  onLearnToggle: () => void;
  lang: 'ar' | 'en';
}) {
  const getDifficultyLabel = (diff: number): string => {
    if (diff === 1) return lang === 'ar' ? 'سهل' : 'Easy';
    if (diff === 2) return lang === 'ar' ? 'متوسط' : 'Medium';
    if (diff === 3) return lang === 'ar' ? 'صعب' : 'Hard';
    if (diff === 4) return lang === 'ar' ? 'صعب جداً' : 'Very Hard';
    return lang === 'ar' ? 'خبير' : 'Expert';
  };

  const getDifficultyColor = (diff: number): string => {
    if (diff === 1) return 'bg-green-500/20 border-green-500/50 text-green-300';
    if (diff === 2) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
    if (diff === 3) return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
    if (diff === 4) return 'bg-red-500/20 border-red-500/50 text-red-300';
    return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 animate-fade-in">
      {/* Sentence content */}
      <div className="mb-4">
        <p className="text-xl font-semibold text-white mb-3 leading-relaxed">
          {sentence.sentence_en}
        </p>
        <p className="text-lg text-purple-400 mb-2">{sentence.sentence_ar}</p>
        <p className="text-sm text-gray-400 italic">{sentence.pronunciation}</p>
      </div>

      {/* Category, Difficulty, and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-300">
          {t(sentence.category, lang)}
        </span>

        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getDifficultyColor(sentence.difficulty)}`}>
          <BarChart3Icon className="w-3 h-3" />
          {getDifficultyLabel(sentence.difficulty)}
        </div>

        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30 transition-all text-sm"
          title={lang === 'ar' ? 'استمع' : 'Listen'}
        >
          <Volume2Icon className="w-4 h-4" />
          <span className="text-xs">{t('listen', lang)}</span>
        </button>
      </div>

      {/* Learn button */}
      <button
        onClick={onLearnToggle}
        className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
          isLearned
            ? 'bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30'
            : 'btn-primary'
        }`}
      >
        {isLearned ? (lang === 'ar' ? 'متعلمة' : 'Learned') : t('learn', lang)}
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse">
      <div className="h-6 bg-gray-700/50 rounded mb-3 w-full" />
      <div className="h-5 bg-gray-700/50 rounded mb-3 w-4/5" />
      <div className="h-4 bg-gray-700/50 rounded mb-4 w-2/3" />
      <div className="flex gap-2 mb-4 pb-4 border-b border-white/10">
        <div className="h-6 bg-gray-700/50 rounded-full flex-1" />
        <div className="h-6 bg-gray-700/50 rounded-full flex-1" />
      </div>
      <div className="h-10 bg-gray-700/50 rounded" />
    </div>
  );
}

export default function SentencesPage() {
  const { profile, updateProfile } = useAuth();
  const { lang, isRTL } = useLanguage();
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [userSentences, setUserSentences] = useState<Record<string, UserSentence>>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch sentences and user progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch sentences
        const { data: sentenceData, error: sentenceError } = await supabase
          .from('sentences')
          .select('*');

        if (!sentenceError && sentenceData && sentenceData.length > 0) {
          setSentences(sentenceData);
        } else {
          setSentences(FALLBACK_SENTENCES);
        }

        // Fetch user sentence progress
        if (profile?.user_id) {
          const { data: userSentenceData } = await supabase
            .from('user_sentences')
            .select('*')
            .eq('user_id', profile.user_id);

          if (userSentenceData) {
            const map = userSentenceData.reduce(
              (acc, item) => ({
                ...acc,
                [item.sentence_id]: item,
              }),
              {}
            );
            setUserSentences(map);
          }
        }
      } catch (err) {
        console.error('Failed to fetch sentences:', err);
        setSentences(FALLBACK_SENTENCES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.user_id]);

  // Filter sentences
  const filteredSentences = sentences.filter((sentence) => {
    const matchesCategory = selectedCategory === 'all' || sentence.category === selectedCategory;
    const matchesSearch =
      sentence.sentence_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sentence.sentence_ar.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Handle marking as learned
  const handleLearnToggle = async (sentence: Sentence) => {
    try {
      const isCurrentlyLearned = userSentences[sentence.id]?.learned || false;
      const newLearnedState = !isCurrentlyLearned;

      // Update Supabase
      const { error } = await supabase.from('user_sentences').upsert({
        sentence_id: sentence.id,
        user_id: profile?.user_id || '',
        learned: newLearnedState,
        review_count: (userSentences[sentence.id]?.review_count || 0) + 1,
        last_reviewed_at: new Date().toISOString(),
      });

      if (!error) {
        // Update local state
        setUserSentences((prev) => ({
          ...prev,
          [sentence.id]: {
            sentence_id: sentence.id,
            learned: newLearnedState,
            review_count: (prev[sentence.id]?.review_count || 0) + 1,
            last_reviewed_at: new Date().toISOString(),
          },
        }));

        // Update profile XP
        if (profile && newLearnedState && !userSentences[sentence.id]?.learned) {
          await updateProfile({
            total_xp: (profile.total_xp || 0) + 15,
          });
        }
      }
    } catch (err) {
      console.error('Failed to update sentence:', err);
    }
  };

  const getLocalizedCategory = (categoryKey: string) => {
    const category = CATEGORIES.find((c) => c.key === categoryKey);
    return category ? t(category.key, lang) : categoryKey;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('sentences', lang)}
          </h1>
          <p className="text-gray-400 mt-2">
            {lang === 'ar' ? 'تعلم جملاً مفيدة للحياة اليومية' : 'Learn useful sentences for everyday life'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder={t('search', lang)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Category filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 text-sm ${
                  selectedCategory === category.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
                    : 'glass-light text-gray-300 hover:text-white border border-white/10'
                }`}
              >
                {getLocalizedCategory(category.key)}
              </button>
            ))}
          </div>
        </div>

        {/* Sentences grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredSentences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSentences.map((sentence) => (
              <SentenceCard
                key={sentence.id}
                sentence={sentence}
                isLearned={userSentences[sentence.id]?.learned || false}
                onLearnToggle={() => handleLearnToggle(sentence)}
                lang={lang}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-gray-400 text-lg">
              {lang === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
