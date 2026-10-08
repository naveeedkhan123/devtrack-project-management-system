import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Bell,
  Mail,
  Shield,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { success, error } = useToast();

  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || (isDark ? 'dark' : 'light'),
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    taskAssignedAlerts: user?.preferences?.taskAssignedAlerts ?? true,
    bugAssignedAlerts: user?.preferences?.bugAssignedAlerts ?? true,
  });

  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await authService.updateProfile({ preferences });
      if (res?.data?.user) {
        updateUser(res.data.user);
        success('Preferences updated successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          System & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Configure appearance theme, automated notifications, and workspace behaviors.
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Appearance & Interface Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select your preferred color scheme for DevTrack.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => {
                if (isDark) toggleTheme();
                setPreferences((prev) => ({ ...prev, theme: 'light' }));
              }}
              className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                !isDark
                  ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                  Light Mode
                </span>
                <span className="text-[10px] text-gray-400">Crisp white canvas</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isDark) toggleTheme();
                setPreferences((prev) => ({ ...prev, theme: 'dark' }));
              }}
              className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                isDark
                  ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-950/20'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                  Dark Mode
                </span>
                <span className="text-[10px] text-gray-400">SaaS midnight surface</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Notification Alerts & Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                  Task Assignments
                </span>
                <span className="text-[11px] text-gray-400">
                  Notify me when a project lead assigns a sprint task to me.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.taskAssignedAlerts}
                onChange={() => handleToggle('taskAssignedAlerts')}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                  Bug Assignment & Resolution Alerts
                </span>
                <span className="text-[11px] text-gray-400">
                  Notify me when a defect report is routed to my queue or resolved.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.bugAssignedAlerts}
                onChange={() => handleToggle('bugAssignedAlerts')}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                  Email Notifications Digest
                </span>
                <span className="text-[11px] text-gray-400">
                  Receive daily sprint summaries and critical bug alerts via email.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSave}
              isLoading={saving}
            >
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
