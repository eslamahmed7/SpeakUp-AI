import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInAsGuest, loading: authLoading } = useAuth();
  const { lang, isRTL } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setError(t('errors.emptyFields', lang));
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError(t('errors.invalidEmail', lang));
        setLoading(false);
        return;
      }

      const result = await signIn(email, password);
      if (!result.error) {
        navigate('/dashboard');
      } else {
        setError(result.error || t('errors.loginFailed', lang));
      }
    } catch (err) {
      setError(t('errors.loginFailed', lang));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await signInAsGuest();
      navigate('/dashboard');
    } catch (err) {
      setError(t('errors.guestLoginFailed', lang));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 right-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className={`text-5xl font-bold ${isRTL ? 'text-right' : 'text-left'} mb-2`}>
            <span className="gradient-text">{t('welcome', lang)}</span>
          </h1>
          <p className={`text-slate-400 text-lg ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('welcomeDesc', lang)}
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-card p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 animate-slide-up shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className={`block text-sm font-semibold text-slate-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('email', lang)}
              </label>
              <div className={`relative ${isRTL ? 'flex flex-row-reverse' : 'flex'}`}>
                <Mail className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400 pointer-events-none" style={isRTL ? { right: '12px' } : { left: '12px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email', lang)}
                  className={`input-field w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:bg-white/10 transition-all ${isRTL ? 'pr-12 text-right' : 'pl-12 text-left'}`}
                  disabled={loading || authLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-semibold text-slate-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('password', lang)}
              </label>
              <div className={`relative ${isRTL ? 'flex flex-row-reverse' : 'flex'}`}>
                <Lock className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400 pointer-events-none" style={isRTL ? { right: '12px' } : { left: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password', lang)}
                  className={`input-field w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:bg-white/10 transition-all ${isRTL ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'}`}
                  disabled={loading || authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-primary-400 transition-colors"
                  style={isRTL ? { left: '12px' } : { right: '12px' }}
                  disabled={loading || authLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                {error}
              </div>
            )}

            {/* Forgot Password Link */}
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                disabled={loading || authLoading}
              >
                {t('forgotPassword', lang)}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="btn-primary w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || authLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {t('loading', lang)}
                </>
              ) : (
                t('login', lang)
              )}
            </button>

            {/* Guest Login Button */}
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading || authLoading}
              className="btn-secondary w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('continueAsGuest', lang)}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-slate-400">{t('noAccount', lang)}</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            disabled={loading || authLoading}
            className="w-full py-3 rounded-lg font-semibold border-2 border-primary-400/50 text-primary-400 hover:bg-primary-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('signUpHere', lang)}
          </button>
        </div>

        
      </div>
    </div>
  );
}
