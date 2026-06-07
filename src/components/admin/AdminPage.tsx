import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, Users, BookOpen, BarChart3, FileText, Layers } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  current_level: number;
  total_xp: number;
  streak_days: number;
  created_at: string;
}

interface Level {
  id: string;
  name: string;
  order_index: number;
  description?: string;
}

interface Vocabulary {
  id: string;
  word: string;
  category: string;
  translation?: string;
}

interface Sentence {
  id: string;
  english: string;
  arabic: string;
  level_id?: string;
}

interface Stats {
  totalUsers: number;
  totalVocabulary: number;
  totalSentences: number;
}

type TabType = 'users' | 'levels' | 'vocabulary' | 'sentences' | 'statistics';

const TAB_CONFIG: Array<{ id: TabType; label: string; icon: React.ComponentType<any> }> = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'levels', label: 'Levels', icon: Layers },
  { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen },
  { id: 'sentences', label: 'Sentences', icon: FileText },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { lang, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(false);

  // Data states
  const [users, setUsers] = useState<Profile[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalVocabulary: 0, totalSentences: 0 });

  // Edit states
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editingLevelName, setEditingLevelName] = useState('');

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab: TabType) => {
    setLoading(true);
    try {
      if (tab === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(50);

        if (!error && data) {
          setUsers(data as Profile[]);
        }
      } else if (tab === 'levels') {
        const { data, error } = await supabase
          .from('levels')
          .select('*')
          .order('order_index', { ascending: true });

        if (!error && data) {
          setLevels(data as Level[]);
        }
      } else if (tab === 'vocabulary') {
        const { data, error } = await supabase
          .from('vocabulary')
          .select('*')
          .limit(50);

        if (!error && data) {
          setVocabulary(data as Vocabulary[]);
        }
      } else if (tab === 'sentences') {
        const { data, error } = await supabase
          .from('sentences')
          .select('*')
          .limit(50);

        if (!error && data) {
          setSentences(data as Sentence[]);
        }
      } else if (tab === 'statistics') {
        // Fetch counts
        const [usersCount, vocabCount, sentencesCount] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('vocabulary').select('id', { count: 'exact' }),
          supabase.from('sentences').select('id', { count: 'exact' }),
        ]);

        setStats({
          totalUsers: usersCount.count || 0,
          totalVocabulary: vocabCount.count || 0,
          totalSentences: sentencesCount.count || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLevel = (level: Level) => {
    setEditingLevelId(level.id);
    setEditingLevelName(level.name);
  };

  const handleSaveLevel = async (levelId: string) => {
    try {
      const { error } = await supabase
        .from('levels')
        .update({ name: editingLevelName })
        .eq('id', levelId);

      if (!error) {
        const updated = levels.map((l) => (l.id === levelId ? { ...l, name: editingLevelName } : l));
        setLevels(updated);
        setEditingLevelId(null);
      }
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingLevelId(null);
    setEditingLevelName('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`min-h-screen gradient-bg pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="backdrop-blur-md bg-black/20 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-3xl font-bold gradient-text">{t('adminPanel', lang)}</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="backdrop-blur-md bg-black/20 border-b border-white/10 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-cyan-400'
                    : 'text-white/60 hover:text-white border-transparent hover:border-white/20'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin">
              <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-cyan-400" />
            </div>
          </div>
        ) : (
          <>
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Users ({users.length})</h2>
                <div className="space-y-3">
                  {users.length === 0 ? (
                    <p className="text-white/60">No users found</p>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="glass glass-card p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="text-white font-semibold">{user.full_name || 'Unknown'}</p>
                          <p className="text-white/60 text-sm">{user.email}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-cyan-400 font-semibold">Level {user.current_level}</p>
                          <p className="text-white/60 text-xs">Current</p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-400 font-semibold">{user.total_xp}</p>
                          <p className="text-white/60 text-xs">XP</p>
                        </div>
                        <div className="text-center">
                          <p className="text-orange-400 font-semibold">{user.streak_days}</p>
                          <p className="text-white/60 text-xs">Streak</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/60 text-xs">{formatDate(user.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Levels Tab */}
            {activeTab === 'levels' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Levels ({levels.length})</h2>
                <div className="space-y-3">
                  {levels.length === 0 ? (
                    <p className="text-white/60">No levels found</p>
                  ) : (
                    levels.map((level) => (
                      <div key={level.id} className="glass glass-card p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white/60 text-sm mb-1">Level {level.order_index}</p>
                          {editingLevelId === level.id ? (
                            <input
                              type="text"
                              value={editingLevelName}
                              onChange={(e) => setEditingLevelName(e.target.value)}
                              className="input-field"
                              autoFocus
                            />
                          ) : (
                            <p className="text-white font-semibold">{level.name}</p>
                          )}
                          {level.description && (
                            <p className="text-white/50 text-xs mt-1">{level.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {editingLevelId === level.id ? (
                            <>
                              <button
                                onClick={() => handleSaveLevel(level.id)}
                                className="px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/40 text-green-400 text-sm font-semibold transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 text-sm font-semibold transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEditLevel(level)}
                              className="px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 text-sm font-semibold transition-colors"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Vocabulary Tab */}
            {activeTab === 'vocabulary' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Vocabulary ({vocabulary.length})</h2>
                <div className="space-y-3">
                  {vocabulary.length === 0 ? (
                    <p className="text-white/60">No vocabulary found</p>
                  ) : (
                    vocabulary.map((word) => (
                      <div key={word.id} className="glass glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div>
                          <p className="text-white font-semibold">{word.word}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Category</p>
                          <p className="text-cyan-400 font-semibold">{word.category}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Translation</p>
                          <p className="text-purple-400">{word.translation || '-'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sentences Tab */}
            {activeTab === 'sentences' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Sentences ({sentences.length})</h2>
                <div className="space-y-3">
                  {sentences.length === 0 ? (
                    <p className="text-white/60">No sentences found</p>
                  ) : (
                    sentences.map((sentence) => (
                      <div key={sentence.id} className="glass glass-card p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-white/60 text-xs mb-1">English</p>
                            <p className="text-white">{sentence.english}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs mb-1">Arabic</p>
                            <p className="text-white text-right">{sentence.arabic}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass glass-card p-8 text-center">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">{stats.totalUsers}</div>
                    <p className="text-white/60">Total Users</p>
                  </div>
                  <div className="glass glass-card p-8 text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">{stats.totalVocabulary}</div>
                    <p className="text-white/60">Total Vocabulary</p>
                  </div>
                  <div className="glass glass-card p-8 text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">{stats.totalSentences}</div>
                    <p className="text-white/60">Total Sentences</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
