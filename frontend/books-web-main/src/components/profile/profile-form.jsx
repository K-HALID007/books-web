"use client";
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff, Edit, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ProfileForm = () => {
  const { user, updateProfile, loading, error, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    city: '',
    favoriteGenres: [],
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction", 
    "Fantasy", "Biography", "History", "Self-Help", "Poetry", 
    "Drama", "Adventure", "Horror", "Comedy", "Philosophy", "Thriller",
    "Young Adult", "Children's Books", "Classic Literature", "Contemporary"
  ];

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", 
    "France", "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark",
    "India", "Japan", "South Korea", "China", "Brazil", "Mexico", "Argentina",
    "South Africa", "Egypt", "Nigeria", "Kenya", "Other"
  ];

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      // Split name into first and last name if it exists
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || firstName,
        lastName: user.lastName || lastName,
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        country: user.country || '',
        city: user.city || '',
        favoriteGenres: user.favoriteGenres || [],
        bio: user.bio || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        favoriteGenres: checked 
          ? [...prev.favoriteGenres, value]
          : prev.favoriteGenres.filter(genre => genre !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    if (error) clearError();
    if (successMessage) setSuccessMessage('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage('');
    if (error) clearError();
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      // Split name into first and last name if it exists
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || firstName,
        lastName: user.lastName || lastName,
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        country: user.country || '',
        city: user.city || '',
        favoriteGenres: user.favoriteGenres || [],
        bio: user.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    }
    setSuccessMessage('');
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMessage('');

    try {
      // Validate password fields if changing password
      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          alert('Current password is required to change password');
          setIsUpdating(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          alert('New passwords do not match');
          setIsUpdating(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          alert('New password must be at least 6 characters');
          setIsUpdating(false);
          return;
        }
      }

      // Prepare data for API
      const profileData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        country: formData.country,
        city: formData.city,
        favoriteGenres: formData.favoriteGenres,
        bio: formData.bio,
      };

      // Add password fields if changing password
      if (formData.newPassword) {
        profileData.currentPassword = formData.currentPassword;
        profileData.newPassword = formData.newPassword;
      }

      // Update profile via API
      await updateProfile(profileData);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false); // Exit edit mode after successful update
      
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Header with Edit/Cancel Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#5D4037]">Profile Information</h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-[#6D4C41] hover:bg-[#5D4037] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-[#5D4037] mb-4 border-b border-gray-200 pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name Field */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-[#5D4037] mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all text-gray-900 placeholder-gray-500 ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-[#A47148] focus:border-transparent bg-white' 
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                    placeholder="Enter your first name"
                  />
                </div>
              </div>

              {/* Last Name Field */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-[#5D4037] mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all text-gray-900 placeholder-gray-500 ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-[#A47148] focus:border-transparent bg-white' 
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#5D4037] mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all text-gray-900 placeholder-gray-500 ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-[#A47148] focus:border-transparent bg-white' 
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-[#5D4037] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg transition-all text-gray-900 placeholder-gray-500 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#A47148] focus:border-transparent bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Date of Birth Field */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-[#5D4037] mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg transition-all text-gray-900 placeholder-gray-500 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#A47148] focus:border-transparent bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Gender Field */}
              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-[#5D4037] mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg transition-all text-gray-900 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#A47148] focus:border-transparent bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Country Field */}
              <div>
                <label htmlFor="country" className="block text-sm font-semibold text-[#5D4037] mb-2">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg transition-all text-gray-900 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#A47148] focus:border-transparent bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <option value="">Select country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Field */}
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-[#5D4037] mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg transition-all text-gray-900 placeholder-gray-500 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#A47148] focus:border-transparent bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  placeholder="Enter your city"
                />
              </div>
            </div>

            {/* Bio Field */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-[#5D4037] mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-lg transition-all resize-none text-gray-900 placeholder-gray-500 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-2 focus:ring-[#A47148] focus:border-transparent bg-white' 
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
                placeholder="Tell us about yourself and your reading interests..."
              />
            </div>

            {/* Favorite Genres - Only show when editing */}
            {isEditing && (
              <div>
                <label className="block text-sm font-semibold text-[#5D4037] mb-3">
                  Favorite Genres (Select multiple)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {genres.map((genre) => (
                    <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={genre}
                        checked={formData.favoriteGenres.includes(genre)}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#6D4C41] bg-gray-100 border-gray-300 rounded focus:ring-[#A47148] focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Display selected genres when not editing */}
            {!isEditing && formData.favoriteGenres.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                  Favorite Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.favoriteGenres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-block bg-[#F0E6D6] text-[#6D4C41] text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Password Change Section - Only show when editing */}
          {isEditing && (
            <div>
              <h3 className="text-lg font-semibold text-[#5D4037] mb-4 border-b border-gray-200 pb-2">
                Change Password
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Leave password fields empty if you don't want to change your password.
              </p>

              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-semibold text-[#5D4037] mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-semibold text-[#5D4037] mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#5D4037] mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A47148] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button - Only show when editing */}
          {isEditing && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="bg-[#6D4C41] hover:bg-[#5D4037] disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;