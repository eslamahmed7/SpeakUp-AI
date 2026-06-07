import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import {
  HandMetalIcon,
  UserIcon,
  SunIcon,
  UsersIcon,
  UtensilsCrossedIcon,
  ShoppingBagIcon,
  PlaneIcon,
  Building2Icon,
  HotelIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  FileTextIcon,
  MessageCircleIcon,
  MicIcon,
  CrownIcon,
  LockIcon,
  CheckIcon,
} from 'lucide-react';

interface Level {
  id: number;
  title_en: string;
  title_ar: string;
  icon: string;
  xp_required: number;
}

const LEVELS: Level[] = [
  { id: 1, title_en: 'Greetings', title_ar: 'التحيات', icon: 'HandMetal', xp_required: 0 },
  { id: 2, title_en: 'Introducing Yourself', title_ar: 'التعريف بالنفس', icon: 'User', xp_required: 200 },
  { id: 3, title_en: 'Daily Life', title_ar: 'الحياة اليومية', icon: 'Sun', xp_required: 500 },
  { id: 4, title_en: 'Family & Friends', title_ar: 'العائلة والأصدقاء', icon: 'Users', xp_required: 900 },
  { id: 5, title_en: 'Restaurant', title_ar: 'المطعم', icon: 'UtensilsCrossed', xp_required: 1400 },
  { id: 6, title_en: 'Shopping', title_ar: 'التسوق', icon: 'ShoppingBag', xp_required: 2000 },
  { id: 7, title_en: 'Travel', title_ar: 'السفر', icon: 'Plane', xp_required: 2700 },
  { id: 8, title_en: 'Airport', title_ar: 'المطار', icon: 'Building2', xp_required: 3500 },
  { id: 9, title_en: 'Hotel', title_ar: 'الفندق', icon: 'Hotel', xp_required: 4400 },
  { id: 10, title_en: 'Workplace English', title_ar: 'الإنجليزية في مكان العمل', icon: 'Briefcase', xp_required: 5400 },
  { id: 11, title_en: 'Business English', title_ar: 'الإنجليزية للأعمال', icon: 'TrendingUp', xp_required: 6500 },
  { id: 12, title_en: 'Job Interview', title_ar: 'مقابلة العمل', icon: 'FileText', xp_required: 7700 },
  { id: 13, title_en: 'Advanced Conversation', title_ar: 'المحادثة المتقدمة', icon: 'MessageCircle', xp_required: 9000 },
  { id: 14, title_en: 'Public Speaking', title_ar: 'التحدث أمام الجمهور', icon: 'Mic', xp_required: 10400 },
  { id: 15, title_en: 'Fluent English Master', title_ar: 'ماستر الإنجليزية', icon: 'Crown', xp_required: 12000 },
];

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  HandMetal: HandMetalIcon,
  User: UserIcon,
  Sun: SunIcon,
  Users: UsersIcon,
  UtensilsCrossed: UtensilsCrossedIcon,
  ShoppingBag: ShoppingBagIcon,
  Plane: PlaneIcon,
  Building2: Building2Icon,
  Hotel: HotelIcon,
  Briefcase: BriefcaseIcon,
  TrendingUp: TrendingUpIcon,
  FileText: FileTextIcon,
  MessageCircle: MessageCircleIcon,
  Mic: MicIcon,
  Crown: CrownIcon,
};

export default function LevelsPage() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { lang, isRTL } = useLanguage();
  const [levels, setLevels] = useState<Level[]>(LEVELS);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const { data, error } = await supabase
          .from('levels')
          .select('*')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          setLevels(data);
        }
      } catch (err) {
        console.error('Failed to fetch levels from Supabase:', err);
      }
    };

    fetchLevels();
  }, []);

  const userXP = profile?.total_xp ?? 0;
  const currentLevel = profile?.current_level ?? 1;

  const getLevelStatus = (level: Level) => {
    const isCompleted = level.id <= currentLevel;
    const isUnlocked = userXP >= level.xp_required;
    const isCurrent = level.id === currentLevel;
    return { isCompleted, isUnlocked, isCurrent };
  };

  const handleLevelClick = (level: Level) => {
    const { isUnlocked } = getLevelStatus(level);
    if (isUnlocked) {
      navigate(`/levels/${level.id}`);
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = ICON_MAP[iconName];
    return Icon || UserIcon;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="glass p-8 rounded-2xl">
          <p className="text-white">{t('loading', lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('levels', lang)}
          </h1>
          <p className="text-gray-400 mt-2">
            {lang === 'ar' ? 'مسار التعلم الخاص بك' : 'Your Learning Path'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Summary */}
        <div className="glass-card rounded-2xl p-6 mb-12 border border-white/10">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">{t('level', lang)}</p>
              <p className="text-3xl font-bold text-blue-400">{currentLevel}</p>
            </div>
            <div className="text-center border-l border-r border-white/10">
              <p className="text-gray-400 text-sm mb-1">{t('xp', lang)}</p>
              <p className="text-3xl font-bold text-purple-400">{userXP.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">{lang === 'ar' ? 'إجمالي' : 'Total'}</p>
              <p className="text-3xl font-bold text-pink-400">{levels.length}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full md:left-1/2 md:transform md:-translate-x-1/2" />

          {/* Levels */}
          <div className="space-y-8">
            {levels.map((level, index) => {
              const { isCompleted, isUnlocked, isCurrent } = getLevelStatus(level);
              const IconComponent = getIconComponent(level.icon);
              const title = lang === 'ar' ? level.title_ar : level.title_en;
              const nextLevel = index < levels.length - 1 ? levels[index + 1] : null;
              const nextLevelXPRequired = nextLevel?.xp_required ?? level.xp_required;
              const xpUntilNext = Math.max(0, nextLevelXPRequired - userXP);

              return (
                <div
                  key={level.id}
                  className={`relative md:flex md:items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Center circle node */}
                  <div className="flex items-center justify-center md:flex-1">
                    <button
                      onClick={() => handleLevelClick(level)}
                      disabled={!isUnlocked}
                      className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform ${
                        isCurrent
                          ? 'scale-110 ring-2 ring-offset-4 ring-offset-slate-900 ring-blue-400 shadow-lg shadow-blue-500/50'
                          : 'scale-100 hover:scale-105'
                      } ${
                        isCompleted
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                          : isUnlocked
                            ? 'glass-light text-gray-300 hover:text-white'
                            : 'bg-slate-700/50 text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                      title={isUnlocked ? '' : `${t('loading', lang)}`}
                    >
                      {isCompleted ? (
                        <CheckIcon className="w-8 h-8" />
                      ) : isUnlocked ? (
                        <IconComponent className="w-8 h-8" />
                      ) : (
                        <LockIcon className="w-8 h-8" />
                      )}
                    </button>
                  </div>

                  {/* Card content */}
                  <div className={`md:flex-1 md:px-8 mt-4 md:mt-0 ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
                    <div
                      onClick={() => handleLevelClick(level)}
                      className={`glass-card rounded-xl p-6 border transition-all duration-300 ${
                        isCurrent
                          ? 'border-blue-400/50 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : isUnlocked
                            ? 'border-white/10 hover:border-white/20 hover:bg-white/5'
                            : 'border-slate-700/50 opacity-75'
                      } ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      {/* Level header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            {lang === 'ar' ? 'المستوى' : 'Level'} {level.id}
                          </p>
                          <h3 className="text-xl font-bold text-white">{title}</h3>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {isCompleted && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
                              <CheckIcon className="w-4 h-4 text-green-400" />
                              <span className="text-xs font-semibold text-green-400">
                                {lang === 'ar' ? 'مكتمل' : 'Completed'}
                              </span>
                            </div>
                          )}
                          {!isUnlocked && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50">
                              <LockIcon className="w-4 h-4 text-yellow-400" />
                              <span className="text-xs font-semibold text-yellow-400">
                                {lang === 'ar' ? 'مقفول' : 'Locked'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* XP requirement */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-2">
                            {lang === 'ar' ? 'نقاط مطلوبة' : 'XP Required'}
                          </p>
                          <p className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {level.xp_required.toLocaleString()} XP
                          </p>
                        </div>

                        {/* XP progress to next level */}
                        {isUnlocked && nextLevel && (
                          <div className="flex-1 mx-4">
                            <p className="text-xs text-gray-400 mb-2">
                              {lang === 'ar' ? 'إلى المستوى التالي' : 'To Next Level'}
                            </p>
                            <div className="progress-bar rounded-full h-2 bg-slate-700/50 overflow-hidden">
                              <div
                                className="progress-fill h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((userXP - level.xp_required) / (nextLevelXPRequired - level.xp_required)) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {xpUntilNext.toLocaleString()} {lang === 'ar' ? 'نقطة متبقية' : 'XP remaining'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      {isUnlocked && (
                        <button
                          onClick={() => handleLevelClick(level)}
                          className="mt-4 w-full btn-primary rounded-lg py-2 font-semibold text-white text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                        >
                          {isCompleted ? (t('continue', lang)) : (t('start', lang))}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer message */}
        <div className="mt-16 text-center">
          <p className="text-gray-400">
            {lang === 'ar'
              ? 'استمر في التعلم لفتح المستويات التالية'
              : 'Keep learning to unlock the next levels'}
          </p>
        </div>
      </div>

      {/* Pulse animation for current level */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .pulse-current {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
