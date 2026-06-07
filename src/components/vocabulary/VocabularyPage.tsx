import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Volume2Icon, ChevronDownIcon, StarIcon } from 'lucide-react';

interface Vocabulary {
  id: string;
  word_en: string;
  word_ar: string;
  pronunciation_en: string;
  pronunciation_ar: string;
  category: string;
  example_en: string;
  example_ar: string;
  difficulty: number;
}

interface UserVocabulary {
  vocabulary_id: string;
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

const FALLBACK_VOCABULARY: Vocabulary[] = [
  {
    id: '1',
    word_en: 'Hello',
    word_ar: 'مرحبا',
    pronunciation_en: 'hə-ˈlō',
    pronunciation_ar: 'mar-ha-ba',
    category: 'daily_life',
    example_en: 'Hello, how are you?',
    example_ar: 'مرحبا، كيف حالك؟',
    difficulty: 1,
  },
  {
    id: '2',
    word_en: 'Water',
    word_ar: 'ماء',
    pronunciation_en: 'ˈwȯ-tər',
    pronunciation_ar: 'ma-a',
    category: 'food',
    example_en: 'I need a glass of water',
    example_ar: 'أحتاج إلى كوب من الماء',
    difficulty: 1,
  },
  {
    id: '3',
    word_en: 'Restaurant',
    word_ar: 'مطعم',
    pronunciation_en: 'ˈres-tə-ˌrant',
    pronunciation_ar: 'mat-am',
    category: 'restaurant',
    example_en: 'Where is the nearest restaurant?',
    example_ar: 'أين أقرب مطعم؟',
    difficulty: 2,
  },
  {
    id: '4',
    word_en: 'Flight',
    word_ar: 'رحلة جوية',
    pronunciation_en: 'ˈflīt',
    pronunciation_ar: 'rehlat jawia',
    category: 'travel',
    example_en: 'My flight is at 10 AM',
    example_ar: 'رحلتي في الساعة العاشرة صباحاً',
    difficulty: 2,
  },
  {
    id: '5',
    word_en: 'Meeting',
    word_ar: 'اجتماع',
    pronunciation_en: 'ˈmē-tiŋ',
    pronunciation_ar: 'ij-ti-ma',
    category: 'business',
    example_en: 'The meeting starts at 2 PM',
    example_ar: 'الاجتماع يبدأ الساعة الثانية ظهراً',
    difficulty: 2,
  },
  {
    id: '6',
    word_en: 'Computer',
    word_ar: 'حاسوب',
    pronunciation_en: 'kəm-ˈpyü-tər',
    pronunciation_ar: 'ha-su-b',
    category: 'technology',
    example_en: 'I work on a computer',
    example_ar: 'أعمل على حاسوب',
    difficulty: 1,
  },
  {
    id: '7',
    word_en: 'Sister',
    word_ar: 'أخت',
    pronunciation_en: 'ˈsis-tər',
    pronunciation_ar: 'ukht',
    category: 'family',
    example_en: 'My sister is a teacher',
    example_ar: 'أختي معلمة',
    difficulty: 1,
  },
  {
    id: '8',
    word_en: 'Shopping',
    word_ar: 'التسوق',
    pronunciation_en: 'ˈshä-piŋ',
    pronunciation_ar: 'at-tasawwuq',
    category: 'shopping',
    example_en: 'I love shopping on weekends',
    example_ar: 'أحب التسوق في نهاية الأسبوع',
    difficulty: 2,
  },
  {
    id: '9',
    word_en: 'Hotel',
    word_ar: 'فندق',
    pronunciation_en: 'hō-ˈtel',
    pronunciation_ar: 'fun-duq',
    category: 'hotel',
    example_en: 'The hotel has free WiFi',
    example_ar: 'الفندق يوفر واي فاي مجاني',
    difficulty: 1,
  },
  {
    id: '10',
    word_en: 'Airport',
    word_ar: 'مطار',
    pronunciation_en: 'ˈer-ˌpȯrt',
    pronunciation_ar: 'matar',
    example_en: 'The airport is very busy',
    example_ar: 'المطار مزدحم جداً',
    category: 'airport',
    difficulty: 1,
  },
];

function VocabularyCard({
  vocab,
  isLearned,
  onLearnToggle,
  lang,
}: {
  vocab: Vocabulary;
  isLearned: boolean;
  onLearnToggle: () => void;
  lang: 'ar' | 'en';
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white mb-1">{vocab.word_en}</h3>
        <p className="text-xl text-purple-400 font-semibold mb-2">{vocab.word_ar}</p>
        <p className="text-sm text-gray-400 italic">{vocab.pronunciation_en}</p>
        <p className="text-sm text-gray-500">({vocab.pronunciation_ar})</p>
      </div>

      {/* Difficulty dots */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < vocab.difficulty ? 'bg-orange-400' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Category badge and buttons */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-300">
          {t(vocab.category, lang)}
        </span>
        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30 transition-all text-sm"
          title={lang === 'ar' ? 'استمع' : 'Listen'}
        >
          <Volume2Icon className="w-4 h-4" />
          <span className="text-xs">{t('listen', lang)}</span>
        </button>
      </div>

      {/* Learn/Learned toggle */}
      <button
        onClick={onLearnToggle}
        className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 mb-4 ${
          isLearned
            ? 'bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30'
            : 'btn-primary'
        }`}
      >
        {isLearned ? (
          <span className="flex items-center justify-center gap-2">
            <StarIcon className="w-4 h-4 fill-green-400" />
            {lang === 'ar' ? 'متعلمة' : 'Learned'}
          </span>
        ) : (
          t('learn', lang)
        )}
      </button>

      {/* Example section */}
      <div className="border-t border-white/10 pt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <span>{lang === 'ar' ? 'مثال' : 'Example'}</span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
        {expanded && (
          <div className="mt-3 space-y-2 animate-fade-in">
            <p className="text-gray-300">{vocab.example_en}</p>
            <p className="text-gray-400 text-sm">{vocab.example_ar}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse">
      <div className="h-6 bg-gray-700/50 rounded mb-4 w-3/4" />
      <div className="h-5 bg-gray-700/50 rounded mb-3 w-1/2" />
      <div className="h-4 bg-gray-700/50 rounded mb-4 w-2/3" />
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gray-700/50 rounded-full" />
        ))}
      </div>
      <div className="h-10 bg-gray-700/50 rounded mb-4" />
      <div className="h-4 bg-gray-700/50 rounded mt-4" />
    </div>
  );
}

export default function VocabularyPage() {
  const { profile, updateProfile } = useAuth();
  const { lang, isRTL } = useLanguage();
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [userVocabulary, setUserVocabulary] = useState<Record<string, UserVocabulary>>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch vocabulary and user progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch vocabulary
        const { data: vocabData, error: vocabError } = await supabase
          .from('vocabulary')
          .select('*');

        if (!vocabError && vocabData && vocabData.length > 0) {
          setVocabulary(vocabData);
        } else {
          setVocabulary(FALLBACK_VOCABULARY);
        }

        // Fetch user vocabulary progress
        if (profile?.user_id) {
          const { data: userVocabData } = await supabase
            .from('user_vocabulary')
            .select('*')
            .eq('user_id', profile.user_id);

          if (userVocabData) {
            const map = userVocabData.reduce(
              (acc, item) => ({
                ...acc,
                [item.vocabulary_id]: item,
              }),
              {}
            );
            setUserVocabulary(map);
          }
        }
      } catch (err) {
        console.error('Failed to fetch vocabulary:', err);
        setVocabulary(FALLBACK_VOCABULARY);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.user_id]);

  // Filter vocabulary
  const filteredVocabulary = vocabulary.filter((word) => {
    const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
    const matchesSearch =
      word.word_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.word_ar.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Handle marking as learned
  const handleLearnToggle = async (vocab: Vocabulary) => {
    try {
      const isCurrentlyLearned = userVocabulary[vocab.id]?.learned || false;
      const newLearnedState = !isCurrentlyLearned;

      // Update Supabase
      const { error } = await supabase.from('user_vocabulary').upsert({
        vocabulary_id: vocab.id,
        user_id: profile?.user_id || '',
        learned: newLearnedState,
        review_count: (userVocabulary[vocab.id]?.review_count || 0) + 1,
        last_reviewed_at: new Date().toISOString(),
      });

      if (!error) {
        // Update local state
        setUserVocabulary((prev) => ({
          ...prev,
          [vocab.id]: {
            vocabulary_id: vocab.id,
            learned: newLearnedState,
            review_count: (prev[vocab.id]?.review_count || 0) + 1,
            last_reviewed_at: new Date().toISOString(),
          },
        }));

        // Update profile XP and words learned
        if (profile && newLearnedState && !userVocabulary[vocab.id]?.learned) {
          await updateProfile({
            words_learned: (profile.words_learned || 0) + 1,
            total_xp: (profile.total_xp || 0) + 10,
          });
        }
      }
    } catch (err) {
      console.error('Failed to update vocabulary:', err);
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
            {t('vocabulary', lang)}
          </h1>
          <p className="text-gray-400 mt-2">
            {lang === 'ar' ? 'تعلم الكلمات الجديدة وطورها' : 'Learn and expand your vocabulary'}
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

        {/* Vocabulary grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredVocabulary.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVocabulary.map((vocab) => (
              <VocabularyCard
                key={vocab.id}
                vocab={vocab}
                isLearned={userVocabulary[vocab.id]?.learned || false}
                onLearnToggle={() => handleLearnToggle(vocab)}
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
