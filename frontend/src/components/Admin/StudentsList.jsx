import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  UserGroupIcon,          // Main header icon for students
  UserCircleIcon,         // For individual student username
  EnvelopeIcon,           // For email
  BookOpenIcon,           // For enrolled courses
  AcademicCapIcon,        // For certificates earned
  XMarkIcon,                // For ban status/action
  CheckCircleIcon,        // For unban action/success
  ArrowPathIcon,          // Loading spinner
  ExclamationCircleIcon,  // Error/Warning icon
  ClipboardDocumentListIcon // For no students found state
} from '@heroicons/react/24/outline'; // Ensure you've installed @heroicons/react

const BASE_URL = 'http://127.0.0.1:8000'; // Define your base URL

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(true); // For initial list fetch
  const [submittingId, setSubmittingId] = useState(null); // To track which student's action is pending
  const [unauthorized, setUnauthorized] = useState(false); // For admin access permission
  const [errors, setErrors] = useState({}); // General and action-specific errors
  const [successMsg, setSuccessMsg] = useState(''); // Success messages

  const token = localStorage.getItem('access');

  const fetchStudents = async () => {
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
      const res = await axios.get(`${BASE_URL}/api/admin/students/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUnauthorized(true);
      } else {
        setErrors({ general: 'Failed to load student list. Please try again.' });
      }
    } finally {
      setLoadingList(false);
    }
  };

  const toggleBan = async (id) => {
    setSubmittingId(id);
    setErrors({}); // Clear previous errors
    setSuccessMsg(''); // Clear previous success messages

    const studentToUpdate = students.find(s => s.id === id);
    if (!studentToUpdate) {
      setErrors({ general: 'Student not found for update.' });
      setSubmittingId(null);
      return;
    }

    // Optimistic UI update
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === id ? { ...student, is_banned: !student.is_banned } : student
      )
    );

    try {
      await axios.patch(`${BASE_URL}/api/admin/students/${id}/ban-toggle/`, null, { // null for empty body PATCH
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccessMsg(`Ban status updated for ${studentToUpdate.username}.`);
      // No need to fetchStudents() if optimistic update is reliable and backend sends no new data.
      // If backend sends updated user data, you could use that: setStudents(prev => prev.map(s => s.id === id ? res.data : s));
    } catch (err) {
      console.error(`Error toggling ban for student ${id}:`, err.response?.data || err.message);
      // Revert optimistic update on error
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === id ? { ...student, is_banned: studentToUpdate.is_banned } : student
        )
      );
      if (err.response && err.response.data) {
        setErrors(prev => ({
          ...prev,
          [`student_${id}_ban`]: err.response.data.detail || err.response.data.non_field_errors?.[0] || 'Update failed.',
          general: 'One or more updates failed. Check individual student errors.'
        }));
      } else {
        setErrors(prev => ({ ...prev, general: 'An unexpected error occurred during update.' }));
      }
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => { fetchStudents(); }, []); // Run once on mount

  // --- Render Logic ---

  if (loadingList) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-slate-900 rounded-lg shadow-lg max-w-2xl mx-auto mt-10 p-8">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-500" />
          <span>Loading student list...</span>
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
        <UserGroupIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        <span>Student List</span>
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

      {students.length === 0 && !loadingList && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <ClipboardDocumentListIcon className="h-20 w-20 mx-auto mb-4" />
          <p className="text-lg">No students found.</p>
        </div>
      )}

      <div className="space-y-4">
        {students.map(s => (
          <div
            key={s.id}
            className={`p-5 rounded-xl shadow-md transition-all duration-300 ease-in-out
                       ${s.is_banned ? 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700' : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'}
                       flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}
          >
            {/* Student Info */}
            <div className="flex flex-col">
              <p className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                {s.username}
                <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium ${s.is_banned ? 'bg-red-600 text-white' : 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'}`}>
                    {s.is_banned ? 'Banned' : 'Active'}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 ml-8 flex items-center gap-2 mt-1">
                <EnvelopeIcon className="h-4 w-4 text-gray-400" /> {s.email}
              </p>
              {s.enrolled_courses && s.enrolled_courses.length > 0 && (
                <p className="text-sm text-gray-700 dark:text-gray-200 ml-8 flex items-start gap-2 mt-2">
                  <BookOpenIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" /> Enrolled in:
                  <span className="font-normal flex flex-wrap gap-x-2">
                    {s.enrolled_courses.map((course, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full text-xs font-medium">
                        {course}
                      </span>
                    ))}
                  </span>
                </p>
              )}
              {s.certificates_earned && s.certificates_earned.length > 0 && (
                <p className="text-sm text-gray-700 dark:text-gray-200 ml-8 flex items-start gap-2 mt-1">
                  <AcademicCapIcon className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" /> Certificates:
                  <span className="font-normal flex flex-wrap gap-x-2">
                    {s.certificates_earned.map((cert, idx) => (
                      <span key={idx} className="bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100 px-2 py-0.5 rounded-full text-xs font-medium">
                        {cert}
                      </span>
                    ))}
                  </span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 sm:ml-auto">
              <button
                onClick={() => toggleBan(s.id)}
                disabled={submittingId === s.id}
                className={`flex items-center px-4 py-2 rounded-full text-white text-sm font-medium transition-all duration-200 ease-in-out
                           ${s.is_banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {submittingId === s.id ? (
                  <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                ) : s.is_banned ? (
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                ) : (
                  <XMarkIcon className="h-4 w-4 mr-2" />
                )}
                {submittingId === s.id ? 'Updating...' : (s.is_banned ? 'Unban Student' : 'Ban Student')}
              </button>
            </div>

            {/* Individual Error for this student/action */}
            {errors[`student_${s.id}_ban`] && (
              <p className="mt-2 text-red-500 text-xs w-full sm:w-auto sm:ml-auto">
                <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />{errors[`student_${s.id}_ban`]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentList;