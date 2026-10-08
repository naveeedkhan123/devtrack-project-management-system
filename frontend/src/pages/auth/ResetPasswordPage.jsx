import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layers, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ResetPasswordPage = () => {
  const { token: urlToken } = useParams();
  const [token, setToken] = useState(urlToken || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorText('Reset token is required');
      return;
    }
    if (password.length < 6) {
      setErrorText('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorText('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token, password);
      success('Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-[#0B0F19] transition-colors">
      <div className="w-full max-w-md">
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
            Create new password
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Choose a strong password with at least 6 characters
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!urlToken && (
              <Input
                label="Reset Token"
                placeholder="Paste reset token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            )}

            <Input
              label="New Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {errorText && (
              <p className="text-xs text-rose-500 font-medium">{errorText}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Update Password
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link
              to="/login"
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
