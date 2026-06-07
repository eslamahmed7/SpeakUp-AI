import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, HelpCircle, Mic, MessageCircle, Lock, CheckCircle2, PlayCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';

interface Lesson {
  id: string;
  level_id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  type: 'lesson' | 'quiz' | 'pronunciation' | 'conversation';
  duration: number;
  xp_reward: number;
  order_index: number;
  content: Record<string, unknown>;
}

interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number | null;
  xp_earned: number | null;
  created_at: string;
  updated_at: string;
}

interface Level {
  id: string;
  level_number: number;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
}

const getLessonIcon = (type: string) => {
  switch (type) {
    case 'lesson':
      return <BookOpen className="w-5 h-5" />;
    case 'quiz':
      return <HelpCircle className="w-5 h-5" />;
    case 'pronunciation':
      return <Mic className="w-5 h-5" />;
    case 'conversation':
      return <MessageCircle className="w-5 h-5" />;
    default:
      return <BookOpen className="w-5 h-5" />;
  }
};

export default function LevelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { lang, isRTL } = useLanguage();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      try {
        // Fetch level info
        const { data: levelData } = await supabase
          .from('levels')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (levelData) {
          setLevel(levelData as Level);
        }

        // Fetch lessons for this level
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('level_id', id)
          .order('order_index', { ascending: true });

        if (lessonsData) {
          setLessons(lessonsData as Lesson[]);

          // Fetch user progress for these lessons
          const lessonIds = lessonsData.map((l: Lesson) => l.id);
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds);

          if (progressData) {
            const progressMap = progressData.reduce((acc: Record<string, UserProgress>, p: UserProgress) => {
              acc[p.lesson_id] = p;
              return acc;
            }, {});
            setProgress(progressMap);
          }
        }
      } catch (error) {
        console.error('Error fetching level data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const getLessonStatus = (lesson: Lesson) => {
    const lessonProgress = progress[lesson.id];
    if (lessonProgress?.completed) {
      return 'completed';
    }
    if (lesson.order_index <= (profile?.current_level || 0)) {
      return 'available';
    }
    return 'locked';
  };

  const handleLessonClick = (lessonId: string) => {
    const status = getLessonStatus(lessons.find(l => l.id === lessonId)!);
    if (status !== 'locked') {
      navigate(`/lesson/${lessonId}`);
    }
  };

  if (loading || !level) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>{t('loading', lang)}</p>
        </div>
      </div>
    );
  }

  const levelTitle = lang === 'ar' ? level.title_ar : level.title_en;
  const levelDescription = lang === 'ar' ? level.description_ar : level.description_en;

  return (
    <div className={`min-h-screen pb-24 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <button
            onClick={() => navigate('/levels')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-4xl font-bold text-white">{levelTitle}</h1>
            <p className="text-dark-300">{levelDescription}</p>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {lessons.map((lesson, idx) => {
            const status = getLessonStatus(lesson);
            const lessonTitle = lang === 'ar' ? lesson.title_ar : lesson.title_en;
            const isCompleted = status === 'completed';
            const isLocked = status === 'locked';

            return (
              <button
                key={lesson.id}
                onClick={() => handleLessonClick(lesson.id)}
                disabled={isLocked}
                className={`glass-card p-6 rounded-xl transition-all transform ${
                  isLocked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 active:scale-95 cursor-pointer'
                } ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                {/* Status badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-lg ${
                      isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-primary-500/20 text-primary-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <PlayCircle className="w-5 h-5" />
                      )}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : isLocked
                        ? 'bg-slate-500/20 text-slate-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {isCompleted
                        ? t('completed', lang)
                        : isLocked
                        ? t('locked', lang)
                        : idx === 0
                        ? t('new', lang)
                        : t('available', lang)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{idx + 1}</span>
                </div>

                {/* Lesson info */}
                <h3 className="text-xl font-bold text-white mb-3">{lessonTitle}</h3>

                {/* Type and duration */}
                <div className="flex items-center gap-3 mb-4 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    {getLessonIcon(lesson.type)}
                    {lang === 'ar'
                      ? lesson.type === 'lesson'
                        ? 'درس'
                        : lesson.type === 'quiz'
                        ? 'اختبار'
                        : lesson.type === 'pronunciation'
                        ? 'نطق'
                        : 'محادثة'
                      : lesson.type}
                  </span>
                  <span className="text-xs">{lesson.duration} {t('minutes', lang)}</span>
                </div>

                {/* XP Reward */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-sm text-slate-400">{t('xp', lang)}</span>
                  <span className="text-lg font-bold text-yellow-400">+{lesson.xp_reward}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
