import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  UserCircleIcon, // Default avatar icon
  EnvelopeIcon,    // Email icon
  PhoneIcon,      // Phone number icon
  CalendarIcon,   // Date of Birth / Joined date icon
  CheckCircleIcon, // Verified status icon
  AcademicCapIcon, // Role icon (Student/Teacher)
  PencilSquareIcon, // Edit Profile icon
  ChartBarIcon,   // Dashboard icon
  SparklesIcon,   // Teacher Analytics icon
  UserGroupIcon,  // Become a Teacher icon
  PlusCircleIcon, // Create New Course icon
  CubeTransparentIcon, // Loading icon
  InformationCircleIcon, // Error icon
  AdjustmentsVerticalIcon //Admin icon
} from '@heroicons/react/24/outline'; // Using outline for most icons


const BASE_URL = 'http://127.0.0.1:8000'; // Change as needed

const ProfileCard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access');
        if (!token) {
          throw new Error('Authentication token not found.');
        }
        const res = await axios.get(`${BASE_URL}/api/accounts/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again or log in.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Default banner: a subtle gradient
  const defaultBanner = 'linear-gradient(to right, #4F46E5, #8B5CF6)'; // Indigo to Purple gradient
  // Default avatar: a placeholder image or an icon
  const defaultAvatarPath = '/default-avatar.png'; // Make sure this path is correct relative to your public folder

  const avatarSrc = user?.profile_image ? `${BASE_URL}${user.profile_image}` : defaultAvatarPath;
  const bannerStyle = user?.banner_image ? { backgroundImage: `url(${BASE_URL}${user.banner_image})` } : { backgroundImage: defaultBanner };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-gray-900 rounded-lg shadow-lg max-w-6xl mx-auto mt-6 p-6">
        <div className="flex flex-col items-center space-y-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <CubeTransparentIcon className="animate-spin h-10 w-10 text-indigo-500" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-[300px] flex items-center justify-center p-6 bg-slate-900 rounded-lg shadow-lg max-w-6xl mx-auto mt-6">
        <div className="flex flex-col items-center space-y-3 text-lg font-medium text-red-600 dark:text-red-400">
          <InformationCircleIcon className="h-10 w-10" />
          <span>{error || 'Failed to load profile.'}</span>
          <Link to="/login" className="mt-4 text-indigo-600 hover:underline dark:text-indigo-400">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='w-100% bg-slate-800 py-6 px-4 sm:px-6 lg:px-8'>
    <div className="bg-slate-800 shadow-xl rounded-2xl overflow-hidden max-w-5xl mx-auto border border-gray-100 dark:border-gray-800 font-sans antialiased">
      {/* Banner */}
      <div
        className="h-40 sm:h-48 bg-cover bg-center"
        style={bannerStyle}
      ></div>

      {/* Profile pic + Info */}
      <div className="p-6 sm:p-8 flex flex-col items-center text-center -mt-20">
        <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-gray-850 bg-gray-700 overflow-hidden shadow-lg">
          <img
            src={avatarSrc}
            alt="Profile Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none'; // Hide the broken image
              const parent = e.target.parentElement;
              if (parent) {
                const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                icon.setAttribute('class', 'w-full h-full text-gray-400 dark:text-gray-500');
                icon.setAttribute('fill', 'currentColor');
                icon.setAttribute('viewBox', '0 0 24 24');
                icon.innerHTML = '<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />'; // UserCircleIcon path
                parent.appendChild(icon);
              }
            }}
          />
          {avatarSrc === defaultAvatarPath && (
            <UserCircleIcon className="absolute inset-0 w-full h-full text-gray-400 dark:text-gray-500 p-1" />
          )}
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4">
          {user?.first_name} {user?.last_name}
        </h2>
        <p className="text-indigo-600 dark:text-indigo-400 text-lg font-medium mt-1">@{user?.username}</p>

        <p className="mt-4 text-base text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed max-w-lg">
          {user?.bio || <span className="italic text-gray-500 dark:text-gray-400">No bio provided yet.</span>}
        </p>

        <div className="mt-6 space-y-3 w-full max-w-sm text-left text-gray-700 dark:text-gray-300 border-t border-b border-gray-200 dark:border-gray-700 py-4">
          {user?.email && (
            <p className="flex items-center text-md">
              <EnvelopeIcon className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
              <strong className="min-w-[60px]">Email:</strong> {user.email}
            </p>
          )}
          {user?.phone_number && (
            <p className="flex items-center text-md">
              <PhoneIcon className="h-5 w-5 mr-3 text-green-500 dark:text-green-400" />
              <strong className="min-w-[60px]">Phone:</strong> {user.phone_number}
            </p>
          )}
          {user?.date_of_birth && (
            <p className="flex items-center text-md">
              <CalendarIcon className="h-5 w-5 mr-3 text-purple-500 dark:text-purple-400" />
              <strong className="min-w-[60px]">DOB:</strong> {new Date(user.date_of_birth).toLocaleDateString()}
            </p>
          )}
          <p className="flex items-center text-md">
            <CalendarIcon className="h-5 w-5 mr-3 text-orange-500 dark:text-orange-400" />
            <strong className="min-w-[60px]">Joined:</strong> {new Date(user.joined_at).toLocaleDateString()}
          </p>
          <p className="flex items-center text-md">
            {user.is_verified ? (
              <CheckCircleIcon className="h-5 w-5 mr-3 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <InformationCircleIcon className="h-5 w-5 mr-3 text-red-500 dark:text-red-400" />
            )}
            <strong className="min-w-[60px]">Status:</strong> {user.is_verified ? 'Verified' : 'Not Verified'}
          </p>
          <p className="flex items-center text-md">
            <AcademicCapIcon className="h-5 w-5 mr-3 text-fuchsia-500 dark:text-fuchsia-400" />
            <strong className="min-w-[60px]">Role:</strong> {user.is_teacher ? 'Instructor' : 'Student'}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 w-full">
          <Link to="/edit_profile">
            <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              <PencilSquareIcon className="h-5 w-5 mr-2" />
              Edit Profile
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-xl shadow-lg hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Go to Dashboard
            </button>
          </Link>
          <Link to={user.is_teacher ? "/teacher/analytics" : "/become-teacher"}>
            <button className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
              {user.is_teacher ? (
                <>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  View Teacher Analytics
                </>
              ) : (
                <>
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Become a Teacher
                </>
              )}
            </button>
          </Link>
          {/* Create Course Button (Only for Teachers) */}
          {user.is_teacher && (
            <Link to="/courses/add-new">
              <button className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Create New Course
              </button>
            </Link>
          )}
          {user.is_semi_admin && (
            <Link to="/admin">
              <button className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                <AdjustmentsVerticalIcon className="h-5 w-5 mr-2" />
                Admin Panel
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProfileCard;