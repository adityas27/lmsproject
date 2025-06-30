import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BookOpenIcon,             // Main header icon for courses
  UserIcon,                 // For author name
  EyeIcon,                  // For visible status/action
  EyeSlashIcon,             // For hidden status/action (takedown)
  ArrowPathIcon,            // Loading spinner
  ExclamationCircleIcon,    // Error/Warning icon
  ClipboardDocumentListIcon, // For no courses found state
  CheckCircleIcon           // For success messages
} from '@heroicons/react/24/outline'; // Ensure you've installed @heroicons/react

const BASE_URL = 'http://127.0.0.1:8000'; // Define your base URL

const CourseTakedown = () => {
  const [courses, setCourses] = useState([]);
  const [loadingList, setLoadingList] = useState(true); // For initial list fetch
  const [submittingId, setSubmittingId] = useState(null); // To track which course's action is pending
  const [unauthorized, setUnauthorized] = useState(false); // For admin access permission
  const [errors, setErrors] = useState({}); // General and action-specific errors
  const [successMsg, setSuccessMsg] = useState(''); // Success messages

  const token = localStorage.getItem('access');

  const fetchCourses = async () => {
    setLoadingList(true);
    setUnauthorized(false);
    setErrors({}); // Clear previous errors
    setSuccessMsg(''); // Clear previous success messages

    if (!token) {
      setUnauthorized(true);
      setLoadingList(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/admin/courses/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCourses(res.data);
      console.log('Fetched courses:', res.data); // Log the fetched data for debugging
    } catch (err) {
      console.error('Error fetching courses:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUnauthorized(true);
      } else {
        setErrors({ general: 'Failed to load course list. Please try again.' });
      }
    } finally {
      setLoadingList(false);
    }
  };

  const toggleVisibility = async (id) => {
    setSubmittingId(id);
    setErrors({}); // Clear previous errors
    setSuccessMsg(''); // Clear previous success messages

    const courseToUpdate = courses.find(c => c.slug === id);
    if (!courseToUpdate) {
      setErrors({ general: 'Course not found for update.' });
      setSubmittingId(null);
      return;
    }

    // Optimistic UI update
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === id ? { ...course, is_visible: !course.is_visible } : course
      )
    );

    try {
      await axios.patch(`${BASE_URL}/api/admin/courses/${id}/toggle-visibility/`, null, { // null for empty body PATCH
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccessMsg(`Course "${courseToUpdate.name}" visibility updated.`);
      // If the backend response contains the updated course, you can use that directly
      // setCourses(prev => prev.map(c => c.id === id ? res.data : c));
    } catch (err) {
      console.error(`Error toggling visibility for course ${id}:`, err.response?.data || err.message);
      // Revert optimistic update on error
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === id ? { ...course, is_visible: courseToUpdate.is_visible } : course
        )
      );
      if (err.response && err.response.data) {
        setErrors(prev => ({
          ...prev,
          [`course_${id}_visibility`]: err.response.data.detail || err.response.data.non_field_errors?.[0] || 'Update failed.',
          general: 'One or more updates failed. Check individual course errors.'
        }));
      } else {
        setErrors(prev => ({ ...prev, general: 'An unexpected error occurred during update.' }));
      }
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => { fetchCourses(); }, []); // Run once on mount

  // --- Render Logic ---

  if (loadingList) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-slate-900 rounded-lg shadow-lg max-w-2xl mx-auto mt-10 p-8">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-500" />
          <span>Loading course list...</span>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8 bg-red-50 dark:bg-red-950 rounded-lg shadow-lg max-w-2xl mx-auto mt-10 border border-red-200 dark:border-red-700">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-red-700 dark:text-red-300">
          <ExclamationCircleIcon className="h-12 w-12 text-red-600" />
          <span>Access Denied: You do not have administrator privileges to view this page.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 sm:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700 font-sans antialiased">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white flex items-center justify-center space-x-3">
        <BookOpenIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <span>Manage Course Visibility</span>
      </h2>

      {/* Success Message Display */}
      {successMsg && (
        <div className="flex items-center justify-center p-3 mb-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700">
          <CheckCircleIcon className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}
      {/* General Error Message Display */}
      {errors.general && (
        <div className="flex items-center justify-center p-3 mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-700">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">{errors.general}</p>
        </div>
      )}

      {courses.length === 0 && !loadingList && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <ClipboardDocumentListIcon className="h-20 w-20 mx-auto mb-4" />
          <p className="text-lg">No courses found to manage.</p>
        </div>
      )}

      <div className="space-y-4">
        {courses.map(course => (
          <div
            key={course.id}
            className={`p-5 rounded-xl shadow-md transition-all duration-300 ease-in-out
                       ${course.is_visible
                          ? 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
                          : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 opacity-90' // Highlight hidden courses
                       }
                       flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}
          >
            {/* Course Info */}
            <div className="flex flex-col">
              <p className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpenIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                {course.name} {/* Using course.name as per API response */}
                <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium
                                 ${course.is_visible ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-600 text-white'}`}>
                    {course.is_visible ? 'Visible' : 'Hidden'}
                </span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 ml-8 flex items-center gap-2 mt-1">
                <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Author: {course.author_name}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 sm:ml-auto">
              <button
                onClick={() => toggleVisibility(course.slug)}
                disabled={submittingId === course.slug}
                className={`flex items-center px-4 py-2 rounded-full text-white text-sm font-medium transition-all duration-200 ease-in-out
                           ${course.is_visible ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {submittingId === course.id ? (
                  <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                ) : course.is_visible ? (
                  <EyeSlashIcon className="h-4 w-4 mr-2" />
                ) : (
                  <EyeIcon className="h-4 w-4 mr-2" />
                )}
                {submittingId === course.slug ? 'Updating...' : (course.is_visible ? 'Takedown' : 'Restore')}
              </button>
            </div>

            {/* Individual Error for this course/action */}
            {errors[`course_${course.id}_visibility`] && (
              <p className="mt-2 text-red-500 text-xs w-full sm:w-auto sm:ml-auto">
                <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />{errors[`course_${course.slug}_visibility`]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseTakedown;