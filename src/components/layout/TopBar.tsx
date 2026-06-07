import { Flame, Globe, Bell, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { toggleLang } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 glass border-b border-primary-500/10">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">SpeakUp AI</span>
        </div>

        <div className="flex items-center gap-2">
          {profile && (
            <>
              <div className="flex items-center gap-1.5 glass-light rounded-lg px-3 py-1.5">
                <Flame size={16} className="text-orange-400 streak-fire" />
                <span className="text-sm font-bold text-orange-300">{profile.streak_days}</span>
              </div>
              <button
                onClick={() => navigate('/notifications')}
                className="w-9 h-9 rounded-xl glass-light flex items-center justify-center hover:border-primary-500/30 transition-colors"
              >
                <Bell size={16} className="text-dark-300" />
              </button>
            </>
          )}
          <button
            onClick={toggleLang}
            className="w-9 h-9 rounded-xl glass-light flex items-center justify-center hover:border-primary-500/30 transition-colors"
          >
            <Globe size={16} className="text-dark-300" />
          </button>
        </div>
      </div>
    </header>
  );
}
