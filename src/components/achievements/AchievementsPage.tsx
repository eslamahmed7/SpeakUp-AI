import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, Lock } from 'lucide-react';
import * as Icons from 'lucide-react';

interface Achievement {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  icon: string;
  category: string;
  xp_bonus?: number;
}

interface UnlockedAchievement {
  achievement_id: string;
  unlocked_at: string;
}

const FALLBACK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    name_en: 'First Step',
    name_ar: 'الخطوة الأولى',
    description_en: 'Complete your first lesson',
    description_ar: 'أكمل درسك الأول',
    icon: 'Star',
    category: 'learning',
    xp_bonus: 10,
  },
  {
    id: '2',
    name_en: 'Week Warrior',
    name_ar: 'محارب الأسبوع',
    description_en: '7-day streak',
    description_ar: 'سلسلة 7 أيام',
    icon: 'Flame',
    category: 'streak',
    xp_bonus: 50,
  },
  {
    id: '3',
    name_en: 'Monthly Master',
    name_ar: 'ماستر الشهر',
    description_en: '30-day streak',
    description_ar: 'سلسلة 30 يوم',
    icon: 'Shield',
    category: 'streak',
    xp_bonus: 150,
  },
  {
    id: '4',
    name_en: 'First Conversation',
    name_ar: 'أول محادثة',
    description_en: 'Complete first AI chat',
    description_ar: 'أكمل أول محادثة ذكية',
    icon: 'MessageCircle',
    category: 'conversation',
    xp_bonus: 25,
  },
  {
    id: '5',
    name_en: 'Pronunciation Pro',
    name_ar: 'محترف النطق',
    description_en: 'Score 90+ on pronunciation',
    description_ar: 'حقق 90+ في النطق',
    icon: 'Mic',
    category: 'pronunciation',
    xp_bonus: 75,
  },
  {
    id: '6',
    name_en: 'Vocabulary Hero',
    name_ar: 'بطل المفردات',
    description_en: 'Learn 100 words',
    description_ar: 'تعلم 100 كلمة',
    icon: 'BookOpen',
    category: 'vocabulary',
    xp_bonus: 100,
  },
  {
    id: '7',
    name_en: 'English Explorer',
    name_ar: 'مستكشف الإنجليزية',
    description_en: 'Complete 5 levels',
    description_ar: 'أكمل 5 مستويات',
    icon: 'Globe',
    category: 'learning',
    xp_bonus: 200,
  },
  {
    id: '8',
    name_en: 'Legend',
    name_ar: 'أسطورة',
    description_en: '365-day streak',
    description_ar: 'سلسلة 365 يوم',
    icon: 'Crown',
    category: 'streak',
    xp_bonus: 1000,
  },
];

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    Star: Icons.Star,
    Flame: Icons.Flame,
    Shield: Icons.Shield,
    MessageCircle: Icons.MessageCircle,
    Mic: Icons.Mic,
    BookOpen: Icons.BookOpen,
    Globe: Icons.Globe,
    Crown: Icons.Crown,
    Zap: Icons.Zap,
    Heart: Icons.Heart,
    Target: Icons.Target,
  };
  return iconMap[iconName] || Icons.Star;
};

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, isRTL } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [user?.id]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        setAchievements(FALLBACK_ACHIEVEMENTS);
      } else if (achievementsData) {
        setAchievements(achievementsData as Achievement[]);
      } else {
        setAchievements(FALLBACK_ACHIEVEMENTS);
      }

      // Fetch user's unlocked achievements
      if (user?.id) {
        const { data: unlockedData, error: unlockedError } = await supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', user.id);

        if (!unlockedError && unlockedData) {
          setUnlockedAchievements(unlockedData as UnlockedAchievement[]);
        }
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements(FALLBACK_ACHIEVEMENTS);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (achievementId: string) => {
    return unlockedAchievements.some((ua) => ua.achievement_id === achievementId);
  };

  const getUnlockDate = (achievementId: string) => {
    const unlocked = unlockedAchievements.find((ua) => ua.achievement_id === achievementId);
    if (unlocked) {
      return new Date(unlocked.unlocked_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return null;
  };

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  return (
    <div className={`min-h-screen gradient-bg pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="backdrop-blur-md bg-black/20 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <h1 className="text-3xl font-bold gradient-text">{t('achievements', lang)}</h1>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">
              {unlockedCount} / {totalCount}
            </p>
            <p className="text-white/60 text-sm">{t('unlocked', lang)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin">
              <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-cyan-400" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {achievements.map((achievement) => {
              const Icon = getIconComponent(achievement.icon);
              const unlocked = isUnlocked(achievement.id);
              const unlockDate = getUnlockDate(achievement.id);

              return (
                <div
                  key={achievement.id}
                  className={`glass glass-card p-6 relative overflow-hidden transition-all hover:border-white/30 group ${
                    unlocked
                      ? 'border border-yellow-400/40'
                      : 'opacity-60 grayscale border border-white/10'
                  }`}
                >
                  {/* Background glow for unlocked */}
                  {unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-4">
                      {unlocked ? (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <Icon size={28} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center relative">
                          <Icon size={28} className="text-white/40" />
                          <Lock size={20} className="absolute bottom-0 right-0 text-white/50" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-white mb-2">
                      {lang === 'ar' ? achievement.name_ar : achievement.name_en}
                    </h3>

                    <p className="text-white/70 text-sm mb-4">
                      {lang === 'ar' ? achievement.description_ar : achievement.description_en}
                    </p>

                    {/* XP Bonus */}
                    {achievement.xp_bonus && (
                      <div className="text-cyan-400 text-sm font-semibold mb-3">
                        +{achievement.xp_bonus} XP
                      </div>
                    )}

                    {/* Status Badge and Date */}
                    <div className="flex items-center justify-between">
                      {unlocked ? (
                        <>
                          <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-semibold">
                            {t('unlocked', lang)}
                          </span>
                          {unlockDate && (
                            <span className="text-white/50 text-xs">{unlockDate}</span>
                          )}
                        </>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/50 text-xs font-semibold">
                          {t('locked', lang)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
