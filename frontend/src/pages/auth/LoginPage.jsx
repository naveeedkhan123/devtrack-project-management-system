import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, Code } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-[#0B0F19] transition-colors">
      <div className="w-full max-w-md">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              DevTrack
            </span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Sign in to your workspace
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Access your projects, sprint boards, and defect tracking
          </p>
        </div>

        {/* Demo Fast-fill Buttons */}
        <div className="mb-6 p-3.5 rounded-xl border border-brand-500/20 bg-brand-50/50 dark:bg-brand-950/20">
          <span className="block text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
            ⚡ Quick-Fill Demo Profiles:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@devtrack.io', 'Admin123!')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 hover:border-brand-500 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('pm@devtrack.io', 'Pm123!')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 hover:border-brand-500 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-brand-500" />
              Lead PM
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('dev1@devtrack.io', 'Dev123!')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 hover:border-brand-500 transition-colors"
            >
              <Code className="w-3.5 h-3.5 text-emerald-500" />
              Developer
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </span>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
