import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../lib/i18n';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, loading: authLoading } = useAuth();
  const { lang, isRTL } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  const validatePassword = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return 'strong';
    }
    return 'medium';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(validatePassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        setError(t('errors.nameRequired', lang));
        setLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        setError(t('errors.emailRequired', lang));
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError(t('errors.invalidEmail', lang));
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError(t('errors.passwordTooShort', lang));
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError(t('errors.passwordMismatch', lang));
        setLoading(false);
        return;
      }

      const result = await signUp(formData.email, formData.password, formData.name);

      if (!result.error) {
        navigate('/dashboard');
      } else {
        setError(result.error || t('errors.signupFailed', lang));
      }
    } catch (err) {
      setError(t('errors.signupFailed', lang));
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-red-500/50';
      case 'medium':
        return 'bg-yellow-500/50';
      case 'strong':
        return 'bg-green-500/50';
      default:
        return 'bg-slate-500/30';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return t('auth.signup.passwordWeak', lang);
      case 'medium':
        return t('auth.signup.passwordMedium', lang);
      case 'strong':
        return t('auth.signup.passwordStrong', lang);
      default:
        return '';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className={`text-5xl font-bold ${isRTL ? 'text-right' : 'text-left'} mb-2`}>
            <span className="gradient-text">{t('auth.signup.title', lang)}</span>
          </h1>
          <p className={`text-slate-400 text-lg ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('auth.signup.subtitle', lang)}
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-card p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 animate-slide-up shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className={`block text-sm font-semibold text-slate-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.signup.fullName', lang)}
              </label>
              <div className={`relative ${isRTL ? 'flex flex-row-reverse' : 'flex'}`}>
                <User className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400 pointer-events-none" style={isRTL ? { right: '12px' } : { left: '12px' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('auth.signup.fullNamePlaceholder', lang)}
                  className={`input-field w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:bg-white/10 transition-all ${isRTL ? 'pr-12 text-right' : 'pl-12 text-left'}`}
                  disabled={loading || authLoading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-semibold text-slate-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.signup.email', lang)}
              </label>
              <div className={`relative ${isRTL ? 'flex flex-row-reverse' : 'flex'}`}>
                <Mail className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400 pointer-events-none" style={isRTL ? { right: '12px' } : { left: '12px' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('auth.signup.emailPlaceholder', lang)}
                  className={`input-field w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:bg-white/10 transition-all ${isRTL ? 'pr-12 text-right' : 'pl-12 text-left'}`}
                  disabled={loading || authLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-semibold text-slate-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.signup.password', lang)}
              </label>
              <div className={`relative ${isRTL ? 'flex flex-row-reverse' : 'flex'}`}>
                <Lock className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400 pointer-events-none" style={isRTL ? { right: '12px' } : { left: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('auth.signup.passwordPlaceholder', lang)}
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-1 flex-1 rounded-full ${getPasswordStrengthColor()}`}></div>
                  </div>
                  <p className={`text-xs ${passwordStrength === 'strong' ? 'text-green-400' : passwordStrength === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {getPasswordStrengthText()}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className={`block text-sm font-semibold text-slate-200 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.signup.confirmPassword', lang)}
              </label>
              <div className={`relative ${isRTL ? 'flex flex-row-reverse' : 'flex'}`}>
                <Lock className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400 pointer-events-none" style={isRTL ? { right: '12px' } : { left: '12px' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={t('auth.signup.confirmPasswordPlaceholder', lang)}
                  className={`input-field w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:bg-white/10 transition-all ${isRTL ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'}`}
                  disabled={loading || authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-primary-400 transition-colors"
                  style={isRTL ? { left: '12px' } : { right: '12px' }}
                  disabled={loading || authLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.password && formData.confirmPassword && (
                <div className={`mt-2 flex items-center gap-2 text-sm ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  {formData.password === formData.confirmPassword
                    ? t('auth.signup.passwordsMatch', lang)
                    : t('auth.signup.passwordsMismatch', lang)}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className={`bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="btn-primary w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading || authLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {t('auth.signup.signingUp', lang)}
                </>
              ) : (
                t('auth.signup.signUp', lang)
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-slate-400">{t('auth.signup.haveAccount', lang)}</span>
            </div>
          </div>

          {/* Login Link */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            disabled={loading || authLoading}
            className="w-full py-3 rounded-lg font-semibold border-2 border-primary-400/50 text-primary-400 hover:bg-primary-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('auth.signup.loginHere', lang)}
          </button>
        </div>

        {/* Footer */}
        <p className={`text-center text-slate-500 text-sm mt-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('auth.signup.privacyNotice', lang)}
        </p>
      </div>
    </div>
  );
}
