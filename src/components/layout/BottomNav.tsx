import { NavLink } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, BookText, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';

const navItems = [
  { path: '/', icon: Home, labelKey: 'dashboard' },
  { path: '/levels', icon: BookOpen, labelKey: 'levels' },
  { path: '/conversation', icon: MessageCircle, labelKey: 'conversation' },
  { path: '/vocabulary', icon: BookText, labelKey: 'vocabulary' },
  { path: '/profile', icon: User, labelKey: 'profile' },
];

export default function BottomNav() {
  const { lang } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-primary-500/10">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {navItems.map(({ path, icon: Icon, labelKey }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-400 scale-105'
                  : 'text-dark-400 hover:text-dark-200'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{t(labelKey, lang)}</span>
          </NavLink>
        ))}
      </div>
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
