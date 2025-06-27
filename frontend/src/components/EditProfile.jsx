import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  UserIcon, // For first/last name
  EnvelopeIcon, // For email
  PencilSquareIcon, // For bio
  PhoneIcon, // For phone number
  CalendarDaysIcon, // For date of birth
  PhotoIcon, // For profile and banner image
  ArrowPathIcon, // For loading/submitting
  CheckCircleIcon, // For success message
  ExclamationCircleIcon, // For error message
  ArrowLeftIcon // For back button
} from '@heroicons/react/24/outline'; // Using outline for most icons
import { Link } from 'react-router-dom'; // For navigation

const BASE_URL = 'http://127.0.0.1:8000'; // Make sure this matches your Django backend URL

const EditProfileForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    phone_number: '',
    date_of_birth: '', // YYYY-MM-DD format
  });
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // For initial fetch
  const [submitting, setSubmitting] = useState(false); // For form submission

  // Fetch user data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access');
        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }
        const res = await axios.get(`${BASE_URL}/api/accounts/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = res.data;
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          bio: userData.bio || '',
          phone_number: userData.phone_number || '',
          // Ensure date_of_birth is in YYYY-MM-DD format for input type="date"
          date_of_birth: userData.date_of_birth || '',
        });
        // You might want to display current image previews here if applicable
        // setProfileImage(userData.profile_image ? `${BASE_URL}${userData.profile_image}` : null);
        // setBannerImage(userData.banner_image ? `${BASE_URL}${userData.banner_image}` : null);

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    if (type === 'profile') {
      setProfileImage(e.target.files[0]);
    } else if (type === 'banner') {
      setBannerImage(e.target.files[0]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');

    const data = new FormData();
    for (const key in formData) {
      // Only append fields that have values to avoid sending empty strings for optional fields if not changed
      if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    }
    if (profileImage) data.append('profile_image', profileImage);
    if (bannerImage) data.append('banner_image', bannerImage);

    try {
      await axios.patch(`${BASE_URL}/api/accounts/me/update/`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
          // 'Content-Type': 'multipart/form-data' is usually added automatically by browser for FormData
        },
      });
      setSuccess('Profile updated successfully!');
      // Optionally reset file inputs or provide feedback to user that files were uploaded
      setProfileImage(null);
      setBannerImage(null);
    } catch (err) {
      console.error('Error updating profile:', err.response?.data || err.message);
      setError('Failed to update profile. Please check your inputs.');
      if (err.response?.data) {
        // Display specific backend errors
        const errorMessages = Object.values(err.response.data).flat().join(' ');
        setError(`Failed to update profile: ${errorMessages}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg max-w-xl mx-auto mt-10 p-8">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-500" />
          <span>Loading profile data...</span>
        </div>
      </div>
    );
  }

  if (error && !success) { // Show full error if initial load failed
    return (
      
      <div className="min-h-[400px] flex items-center justify-center p-8 bg-red-50 dark:bg-red-950 rounded-lg shadow-lg max-w-xl mx-auto mt-10 border border-red-200 dark:border-red-700">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-red-700 dark:text-red-300">
          <ExclamationCircleIcon className="h-12 w-12 text-red-600" />
          <span>{error}</span>
          <Link to="/login" className="mt-4 text-blue-600 hover:underline dark:text-blue-400">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-slate-800 min-h-screen flex items-center justify-center w-full'>
    <div className="mx-auto mt-10 p-6 w-2xl sm:p-8 bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800 font-sans antialiased">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/profile"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Profile
        </Link>
      </div>

      <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900 dark:text-white">Edit Profile</h2>

      {success && (
        <div className="flex items-center justify-center p-3 mb-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700">
          <CheckCircleIcon className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}
      {error && !success && ( // Show inline error if submission failed
        <div className="flex items-center justify-center p-3 mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-700">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* First Name */}
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="Your first name"
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="Your last name"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="your@example.com"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
          <div className="relative">
            <PencilSquareIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="e.g., 9876543210"
              maxLength="10"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
        </div>

        {/* Profile Image */}
        <div>
          <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Image (Optional)</label>
          <div className="relative">
            <PhotoIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="file"
              id="profile_image"
              name="profile_image"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'profile')}
              className="w-full pl-10 pr-3 py-2 text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800 transition duration-200"
            />
          </div>
        </div>

        {/* Banner Image */}
        <div>
          <label htmlFor="banner_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Image (Optional)</label>
          <div className="relative">
            <PhotoIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="file"
              id="banner_image"
              name="banner_image"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'banner')}
              className="w-full pl-10 pr-3 py-2 text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800 transition duration-200"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold text-lg
                     bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800
                     transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-lg
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 space-x-2"
        >
          {submitting ? (
            <>
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-3 text-white" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-6 w-6" />
              <span>Update Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
    </div>
  );
};

export default EditProfileForm;