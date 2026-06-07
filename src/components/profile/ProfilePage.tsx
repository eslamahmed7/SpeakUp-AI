import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import {
  LogOut,
  Settings,
  Flame,
  ChevronRight,
  Edit2,
  Check,
  X,
  Download
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut } = useAuth();
  const { lang, isRTL, toggleLang } = useLanguage();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setIsIOS(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  const handleNameSave = async () => {
    if (newName.trim() && newName !== profile?.name) {
      await updateProfile({ name: newName });
    }
    setEditingName(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getStreakBadge = () => {
    const days = profile?.streak_days || 0;
    if (days >= 365) {
      return { label: 'Legend', icon: '👑', color: 'from-purple-500 to-pink-500', className: 'badge-legend' };
    }
    if (days >= 100) {
      return { label: 'Gold', icon: '🥇', color: 'from-yellow-500 to-orange-500', className: 'badge-gold' };
    }
    if (days >= 30) {
      return { label: 'Silver', icon: '🥈', color: 'from-gray-400 to-gray-500', className: 'badge-silver' };
    }
    if (days >= 7) {
      return { label: 'Bronze', icon: '🥉', color: 'from-amber-700 to-orange-700', className: 'badge-bronze' };
    }
    return null;
  };

  const avatar = profile?.avatar_url ? (
    <img
      src={profile.avatar_url}
      alt="Avatar"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className={`w-full h-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br ${profile?.name ? 'from-blue-500 to-purple-500' : 'from-gray-500 to-gray-600'}`}>
      {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
    </div>
  );

  const streakBadge = getStreakBadge();

  return (
    <div className={`min-h-screen gradient-bg pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="backdrop-blur-md bg-black/20 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold gradient-text">{t('profile', lang)}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              {avatar}
            </div>
            {streakBadge && (
              <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${streakBadge.className} border-4 border-black/40 backdrop-blur-md`}>
                {streakBadge.icon}
              </div>
            )}
          </div>

          {/* Name Section */}
          <div className="text-center mb-4">
            {editingName ? (
              <div className="flex items-center gap-2 justify-center mb-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-field max-w-xs"
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/40 transition-colors"
                >
                  <Check size={18} className="text-green-400" />
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNewName(profile?.name || '');
                  }}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors"
                >
                  <X size={18} className="text-red-400" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 mb-2 group cursor-pointer" onClick={() => setEditingName(true)}>
                <h2 className="text-2xl font-bold text-white">{profile?.name || 'User'}</h2>
                <Edit2 size={18} className="text-white/40 group-hover:text-white/70 transition-colors" />
              </div>
            )}
            <p className="text-white/60">{user?.email}</p>
          </div>

          {streakBadge && (
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${streakBadge.color} text-white text-sm font-semibold`}>
              {streakBadge.label}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <div className="glass glass-card p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{profile?.current_level || 1}</div>
            <p className="text-white/60 text-sm">{t('currentLevel', lang)}</p>
          </div>
          <div className="glass glass-card p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{profile?.total_xp || 0}</div>
            <p className="text-white/60 text-sm">{t('totalXP', lang)}</p>
          </div>
          <div className="glass glass-card p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame size={24} className="text-orange-500" />
              <span className="text-3xl font-bold text-orange-400">{profile?.streak_days || 0}</span>
            </div>
            <p className="text-white/60 text-sm">{t('streakDays', lang)}</p>
          </div>
          <div className="glass glass-card p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{profile?.lessons_completed || 0}</div>
            <p className="text-white/60 text-sm">{t('lessonsCompleted', lang)}</p>
          </div>
          <div className="glass glass-card p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{profile?.words_learned || 0}</div>
            <p className="text-white/60 text-sm">{t('wordsLearned', lang)}</p>
          </div>
          <div className="glass glass-card p-6 text-center">
            <div className="text-3xl font-bold text-pink-400 mb-2">{profile?.conversation_minutes || 0}</div>
            <p className="text-white/60 text-sm">{t('conversationMinutes', lang)}</p>
          </div>
        </div>

        {/* Settings Section */}
        <div className="glass glass-card p-6 mb-12">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Settings size={20} />
            {t('settings', lang)}
          </h3>

          <div className="space-y-6">
            {/* Language Toggle */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div>
                <p className="text-white font-medium">{t('language', lang)}</p>
                <p className="text-white/50 text-sm">{lang === 'ar' ? 'العربية' : 'English'}</p>
              </div>
              <button
                onClick={toggleLang}
                className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 transition-colors text-white font-medium"
              >
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{t('notifications', lang)}</p>
                <p className="text-white/50 text-sm">{t('pushNotifications', lang)}</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-green-500/40' : 'bg-white/10'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* PWA Install Section */}
            {!isInstalled && (
              <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Download size={18} className="text-purple-400 animate-bounce" />
                      {lang === 'ar' ? 'تحميل التطبيق على الهاتف والكمبيوتر' : 'Download Mobile & Desktop App'}
                    </p>
                    <p className="text-white/50 text-sm">
                      {lang === 'ar' 
                        ? 'قم بتثبيت التطبيق على شاشتك الرئيسية للوصول السريع والتشغيل كبرنامج مستقل' 
                        : 'Install the app on your home screen for quick, offline-friendly access'}
                    </p>
                  </div>
                  {showInstallBtn ? (
                    <button
                      onClick={handleInstallClick}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-colors text-white font-medium flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {lang === 'ar' ? 'تثبيت الآن' : 'Install Now'}
                    </button>
                  ) : isIOS ? (
                    <span className="text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-center max-w-[200px]">
                      {lang === 'ar' 
                        ? 'اضغط زر المشاركة ⎋ ثم "إضافة للشاشة الرئيسية"' 
                        : 'Tap share button ⎋ then "Add to Home Screen"'}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-center max-w-[200px]">
                      {lang === 'ar' 
                        ? 'افتح خيارات المتصفح ثم اختر "تثبيت التطبيق"' 
                        : 'Open browser menu and select "Install App"'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-white mb-4">{t('quickLinks', lang)}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: t('achievements', lang), icon: '🏆', path: '/achievements' },
              { label: t('dailyChallenge', lang), icon: '⚡', path: '/challenge' },
              { label: t('rolePlay', lang), icon: '🎭', path: '/roleplay' },
              { label: t('pronunciationCoach', lang), icon: '🎤', path: '/pronunciation' },
              { label: t('shadowingMode', lang), icon: '👥', path: '/shadowing' },
              { label: t('adminPanel', lang), icon: '⚙️', path: '/admin' },
            ].map((link, idx) => (
              <button
                key={idx}
                onClick={() => navigate(link.path)}
                className="glass glass-card p-4 flex items-center justify-between group hover:border-white/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{link.icon}</span>
                  <span className="text-white font-medium">{link.label}</span>
                </div>
                <ChevronRight size={20} className="text-white/40 group-hover:text-white/70 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/40 hover:to-red-600/40 border border-red-500/30 text-red-400 font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <LogOut size={20} />
          {t('logout', lang)}
        </button>
      </div>
    </div>
  );
}
