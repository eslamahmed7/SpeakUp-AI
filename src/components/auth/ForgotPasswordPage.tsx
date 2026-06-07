import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { lang, isRTL } = useLanguage();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!email.trim()) {
        setError(t('errors.emailRequired', lang));
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError(t('errors.invalidEmail', lang));
        setLoading(false);
        return;
      }

      // Simulated API call - in production, this would call a backend endpoint
      // to send a password reset email
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitted(true);
      // Auto-redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError(t('errors.resetFailed', lang));
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
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className={`flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-colors mb-8 animate-fade-in ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t('auth.forgotPassword.backToLogin', lang)}</span>
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className={`mb-8 animate-fade-in ${isRTL ? 'text-right' : 'text-left'}`}>
              <h1 className="text-5xl font-bold mb-2">
                <span className="gradient-text">{t('auth.forgotPassword.title', lang)}</span>
              </h1>
              <p className="text-slate-400 text-lg">
                {t('auth.forgotPassword.subtitle', lang)}
              </p>
            </div>

            {/* Glass Card */}
            <div className="glass-card p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 animate-slide-up shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className={`block text-sm font-semibold text-slate-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('auth.forgotPassword.email', lang)}
                  </label>
                  <div className={`relative ${isRTL ? 'flex flex-row-reverse' : 'flex'}`}>
                    <Mail className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400 pointer-events-none" style={isRTL ? { right: '12px' } : { left: '12px' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.forgotPassword.emailPlaceholder', lang)}
                      className={`input-field w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:bg-white/10 transition-all ${isRTL ? 'pr-12 text-right' : 'pl-12 text-left'}`}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Info Text */}
                <p className={`text-sm text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('auth.forgotPassword.info', lang)}
                </p>

                {/* Error Message */}
                {error && (
                  <div className={`bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {t('auth.forgotPassword.sending', lang)}
                    </>
                  ) : (
                    t('auth.forgotPassword.sendLink', lang)
                  )}
                </button>

                {/* Alternative Actions */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-semibold border-2 border-primary-400/50 text-primary-400 hover:bg-primary-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('auth.forgotPassword.backToLogin', lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-semibold text-slate-300 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('auth.forgotPassword.createAccount', lang)}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <p className={`text-center text-slate-500 text-sm mt-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('auth.forgotPassword.privacyNotice', lang)}
            </p>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className={`text-center mb-8 animate-fade-in ${isRTL ? 'text-right' : 'text-left'}`}>
              <h1 className="text-5xl font-bold mb-2">
                <span className="gradient-text">{t('auth.forgotPassword.successTitle', lang)}</span>
              </h1>
              <p className="text-slate-400 text-lg">
                {t('auth.forgotPassword.successSubtitle', lang)}
              </p>
            </div>

            {/* Success Card */}
            <div className="glass-card p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 animate-slide-up shadow-2xl">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-green-500/10 rounded-full p-6 border border-green-500/30">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className={`text-center mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {t('auth.forgotPassword.checkEmail', lang)}
                </h2>
                <p className="text-slate-400 mb-2">
                  {email}
                </p>
                <p className="text-slate-500 text-sm">
                  {t('auth.forgotPassword.checkEmailDescription', lang)}
                </p>
              </div>

              {/* Next Steps */}
              <div className={`bg-white/5 border border-white/10 rounded-lg p-4 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="font-semibold text-white mb-3">{t('auth.forgotPassword.nextSteps', lang)}</h3>
                <ol className={`text-slate-400 text-sm space-y-2 ${isRTL ? 'list-inside' : ''}`}>
                  <li>{t('auth.forgotPassword.step1', lang)}</li>
                  <li>{t('auth.forgotPassword.step2', lang)}</li>
                  <li>{t('auth.forgotPassword.step3', lang)}</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary w-full py-3 rounded-lg font-semibold transition-all"
                >
                  {t('auth.forgotPassword.backToLogin', lang)}
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full py-3 rounded-lg font-semibold text-slate-300 hover:text-slate-200 hover:bg-white/5 transition-all"
                >
                  {t('auth.forgotPassword.tryAgain', lang)}
                </button>
              </div>

              {/* Auto-redirect info */}
              <p className={`text-center text-slate-500 text-xs mt-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.forgotPassword.redirecting', lang)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
