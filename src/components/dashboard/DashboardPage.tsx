import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Zap,
  GraduationCap,
  BookText,
  Play,
  MessageCircle,
  Trophy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}

const getStreakBadge = (streakDays: number): { label: string; className: string; emoji: string } => {
  if (streakDays >= 365) {
    return { label: 'Legend', className: 'badge-legend', emoji: '👑' };
  } else if (streakDays >= 100) {
    return { label: 'Gold', className: 'badge-gold', emoji: '⭐' };
  } else if (streakDays >= 30) {
    return { label: 'Silver', className: 'badge-silver', emoji: '🎖️' };
  } else if (streakDays >= 7) {
    return { label: 'Bronze', className: 'badge-bronze', emoji: '🥉' };
  }
  return { label: '', className: '', emoji: '' };
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();
  const { lang, isRTL } = useLanguage();

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>{t('loading', lang)}</p>
        </div>
      </div>
    );
  }

  const streakBadge = getStreakBadge(profile.streak_days);
  const xpForNextLevel = 200;
  const currentLevelXP = profile.total_xp % xpForNextLevel;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

  // Weekly progress mock data
  const weeklyProgress = [75, 90, 45, 100, 60, 85, 40];
  const days = lang === 'ar'
    ? ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Suggested practice areas
  const suggestedAreas = [
    {
      title: lang === 'ar' ? 'النطق' : 'Pronunciation',
      description: lang === 'ar' ? 'حسّن نطقك الإنجليزي' : 'Improve your English pronunciation',
      icon: '🎤',
      route: '/pronunciation'
    },
    {
      title: lang === 'ar' ? 'المفردات' : 'Vocabulary',
      description: lang === 'ar' ? 'تعلم كلمات جديدة' : 'Learn new words',
      icon: '📚',
      route: '/vocabulary'
    },
    {
      title: lang === 'ar' ? 'القواعد' : 'Grammar',
      description: lang === 'ar' ? 'أتقن قواعد اللغة' : 'Master grammar rules',
      icon: '📝',
      route: '/levels'
    }
  ];

  const stats: StatCard[] = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: t('level', lang),
      value: profile.current_level,
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      label: t('totalXP', lang),
      value: profile.total_xp,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      label: t('lessonsDone', lang),
      value: profile.lessons_completed,
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <BookText className="w-6 h-6" />,
      label: t('wordsLearned', lang),
      value: profile.words_learned,
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className={`min-h-screen pb-24 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="glass-card p-8 rounded-2xl animate-slide-up">
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center justify-between`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h1 className="text-4xl font-bold text-white mb-2">
                {lang === 'ar' ? 'مرحبا بك' : 'Welcome'}, {profile.name}!
              </h1>
              <p className="text-dark-300">
                {lang === 'ar'
                  ? 'استمتع برحلتك في تعلم الإنجليزية'
                  : 'Keep up your amazing learning journey'}
              </p>
            </div>
            {profile.streak_days > 0 && (
              <div className="text-5xl animate-bounce streak-fire">
                🔥
              </div>
            )}
          </div>

          {/* Streak Info */}
          {profile.streak_days > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold text-orange-400">{profile.streak_days}</span>
              <span className="text-dark-300">{t('days', lang)}</span>
              {streakBadge.emoji && (
                <span className="ml-auto text-2xl">{streakBadge.emoji}</span>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid 2x2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="glass-card p-6 rounded-xl text-center group hover:scale-105 transition-transform"
              style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-dark-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* XP Progress to Next Level */}
        <div className="glass-card p-6 rounded-xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center justify-between mb-3`}>
            <span className="text-white font-semibold">{t('xp', lang)}</span>
            <span className="text-dark-400 text-sm">
              {Math.floor(currentLevelXP)} / {xpForNextLevel}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${xpProgress}%` }}></div>
          </div>
          <p className="text-dark-400 text-xs mt-2">
            {lang === 'ar'
              ? `${Math.round(100 - xpProgress)}% لإكمال المستوى التالي`
              : `${Math.round(100 - xpProgress)}% until next level`}
          </p>
        </div>

        {/* Today's Goal */}
        <div className="glass-card p-6 rounded-xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className={`text-xl font-bold text-white mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('todayGoal', lang)}
          </h2>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center justify-between`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <div className="text-white font-semibold">1 {t('lessons', lang)}</div>
              <div className="text-dark-400 text-sm">{lang === 'ar' ? 'هدف اليوم' : 'Daily target'}</div>
            </div>
            <div className="progress-bar w-32">
              <div className="progress-fill" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={() => navigate('/levels')}
            className="glass-card p-4 rounded-xl hover:scale-105 transition-transform group flex flex-col items-center gap-2 text-center"
          >
            <Play className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
            <span className="text-sm font-medium text-white group-hover:text-blue-200">
              {lang === 'ar' ? 'ابدأ درس' : 'Start Lesson'}
            </span>
          </button>

          <button
            onClick={() => navigate('/conversation')}
            className="glass-card p-4 rounded-xl hover:scale-105 transition-transform group flex flex-col items-center gap-2 text-center"
          >
            <MessageCircle className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
            <span className="text-sm font-medium text-white group-hover:text-purple-200">
              {lang === 'ar' ? 'محادثة' : 'AI Chat'}
            </span>
          </button>

          <button
            onClick={() => navigate('/challenge')}
            className="glass-card p-4 rounded-xl hover:scale-105 transition-transform group flex flex-col items-center gap-2 text-center"
          >
            <Trophy className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300" />
            <span className="text-sm font-medium text-white group-hover:text-yellow-200">
              {lang === 'ar' ? 'تحدي' : 'Challenge'}
            </span>
          </button>
        </div>

        {/* Weekly Progress */}
        <div className="glass-card p-6 rounded-xl animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <h2 className={`text-xl font-bold text-white mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('weeklyProgress', lang)}
          </h2>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-end justify-between gap-2 h-32`}>
            {weeklyProgress.map((height, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-gradient-to-t from-primary-500 to-accent-500 rounded-t-lg transition-all duration-300 hover:scale-105"
                     style={{ height: `${(height / 100) * 100}%` }}>
                </div>
                <span className="text-xs text-dark-400">{days[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Practice */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <h2 className={`text-xl font-bold text-white ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('suggestedPractice', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestedAreas.map((area, idx) => (
              <button
                key={idx}
                onClick={() => navigate(area.route)}
                className="glass-card p-6 rounded-xl text-center hover:scale-105 transition-transform group text-left"
              >
                <div className="text-4xl mb-3">{area.icon}</div>
                <h3 className="font-bold text-white group-hover:text-primary-300 mb-1">
                  {area.title}
                </h3>
                <p className="text-sm text-dark-400 group-hover:text-dark-300">
                  {area.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Streak Badge Info */}
        {streakBadge.emoji && (
          <div className="glass-card p-6 rounded-xl animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-4`}>
              <div className={`text-5xl ${streakBadge.className} p-4 rounded-xl`}>
                {streakBadge.emoji}
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="text-white font-bold text-lg">{t('badge', lang)}</h3>
                <p className="text-dark-400">{t(streakBadge.label.toLowerCase(), lang)}</p>
                <p className="text-sm text-dark-500 mt-1">
                  {lang === 'ar'
                    ? `حافظت على سلسلة ${profile.streak_days} يوم متتالي!`
                    : `You've maintained a ${profile.streak_days}-day streak!`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
