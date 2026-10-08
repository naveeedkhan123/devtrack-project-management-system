import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Mail, ArrowLeft, Send, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await authService.forgotPassword(email);
      success('Password reset instructions generated');
      if (res?.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to request reset token');
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
            Reset your password
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your account email to receive a password reset token
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {resetToken ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs">
                <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                  <KeyRound className="w-4 h-4" />
                  Reset Token Generated:
                </div>
                <p className="font-mono bg-white dark:bg-gray-900 p-2 rounded border border-emerald-200 dark:border-emerald-800 break-all select-all text-gray-800 dark:text-gray-200 my-2">
                  {resetToken}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400">
                  For your development and testing convenience, click below to set your new password.
                </p>
              </div>

              <Link to={`/reset-password/${resetToken}`}>
                <Button variant="primary" size="md" className="w-full">
                  Proceed to Reset Password
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                icon={Mail}
                placeholder="dev1@devtrack.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
                icon={Send}
              >
                Generate Reset Token
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
