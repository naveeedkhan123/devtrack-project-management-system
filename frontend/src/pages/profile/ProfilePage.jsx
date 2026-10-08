import React, { useEffect, useRef, useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Save,
  CheckCircle,
  Image,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatDate } from '../../utils/dateUtils';
import { getAvatarUrl, getInitials } from '../../utils/formatters';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [savingProfilePicture, setSavingProfilePicture] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview]
  );

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authService.updateProfile({
        name: profileData.name,
        bio: profileData.bio,
      });
      if (res?.data?.user) {
        updateUser(res.data.user);
        success('Profile updated successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageSelection = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      error('Please select a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('Please select an image under 5MB.');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleProfilePictureSubmit = async () => {
    if (!selectedImage) return;

    try {
      setSavingProfilePicture(true);
      const res = await userService.uploadProfilePicture(selectedImage);
      if (!res?.data?.user) {
        throw new Error('Profile picture was not returned');
      }

      updateUser(res.data.user);
      setSelectedImage(null);
      setImagePreview(null);
      success('Profile picture updated successfully');
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to upload profile picture');
    } finally {
      setSavingProfilePicture(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      error('New password must be at least 6 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      error('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      success('Password changed successfully');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Personal Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage your personal identity, bio, and authentication security.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {getAvatarUrl(user?.avatar || user?.profilePicture) ? (
            <img
              src={getAvatarUrl(user?.avatar || user?.profilePicture)}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center shadow-md">
              {getInitials(user?.name)}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {user?.name}
              </h2>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              Member since {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={profileData.name}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Biography / Professional Summary
              </label>
              <textarea
                rows="3"
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Senior Fullstack Engineer specializing in high-throughput cloud architectures..."
                className="w-full text-xs p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Profile Picture
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {selectedImage ? (
                  <img
                    src={imagePreview}
                    alt="Selected profile picture preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
                  />
                ) : getAvatarUrl(user?.avatar || user?.profilePicture) ? (
                  <img
                    src={getAvatarUrl(user?.avatar || user?.profilePicture)}
                    alt="Current profile picture"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                    <Image className="w-7 h-7" />
                  </div>
                )}
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelection}
                    className="sr-only"
                    aria-label="Choose a profile picture from your device"
                    disabled={savingProfilePicture}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Image}
                      disabled={savingProfilePicture}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose from Device
                    </Button>
                    {selectedImage && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        icon={Upload}
                        isLoading={savingProfilePicture}
                        onClick={handleProfilePictureSubmit}
                      >
                        Save Picture
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose a JPG, PNG, or WEBP image (maximum 5MB).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Save}
                isLoading={savingProfile}
              >
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Security & Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              icon={Lock}
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                icon={Lock}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                icon={Lock}
                value={passwords.confirmNewPassword}
                onChange={(e) =>
                  setPasswords((prev) => ({
                    ...prev,
                    confirmNewPassword: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={savingPassword}
              >
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
