import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Please provide a valid email';
    if (!password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || !validateForm()) return;
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const message = err.code === 'ERR_API_CONFIG'
        ? `${err.message} Set VITE_API_URL to the deployed API base URL ending in /api, then rebuild and redeploy.`
        : status === 404
          ? 'The sign-in API route was not found. Check that VITE_API_URL points to the deployed backend API.'
          : err.response?.data?.message || err.response?.data?.error?.message ||
            (err.code === 'ERR_NETWORK' || !err.response
              ? 'Unable to reach the sign-in service. Please try again shortly.'
              : 'Unable to sign in with those details.');
      error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen min-h-[100svh] bg-slate-50 dark:bg-[#0B0F19] px-4 py-8 sm:px-6 sm:py-12 flex items-center justify-center overflow-x-hidden">
      <div className="w-full max-w-[460px]">
        <header className="text-center mb-7 sm:mb-9">
          <Link to="/" aria-label="DevTrack home" className="inline-flex items-center gap-2.5 mb-7 group">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">DevTrack</span>
          </Link>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600 dark:text-brand-400 mb-2">Your team workspace</p>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">Sign in to your workspace</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Pick up where your team left off.</p>
        </header>

        <section className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-900/[.06] dark:shadow-black/20">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Email address"
              type="email"
              name="email"
              icon={Mail}
              placeholder="you@company.com"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setErrors((prev) => ({ ...prev, email: '' })); }}
              error={errors.email}
              required
              disabled={loading}
              className="min-h-12 text-base sm:text-sm"
            />
            <div>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password <span className="text-rose-500">*</span></label>
                <Link to="/forgot-password" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setErrors((prev) => ({ ...prev, password: '' })); }}
                  error={errors.password}
                  required
                  disabled={loading}
                  className="min-h-12 text-base sm:text-sm pr-12"
                />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((shown) => !shown)} className="absolute right-2 top-2 h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="primary" size="md" className="w-full min-h-12 mt-1" isLoading={loading} disabled={loading} icon={ArrowRight} iconPosition="right">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">New to DevTrack?{' '}
              <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Create an account</Link>
            </p>
          </div>
        </section>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500"><ShieldCheck size={14} /> Secure sign-in for your workspace</p>
      </div>
    </main>
  );
};

export default LoginPage;
