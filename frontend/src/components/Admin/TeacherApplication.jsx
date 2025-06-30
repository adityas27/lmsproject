import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AcademicCapIcon,       // Main header icon for applications
  UserCircleIcon,         // For user/applicant
  BookOpenIcon,           // For education
  LightBulbIcon,          // For skills
  ClockIcon,              // For pending status
  CheckCircleIcon,        // For approved status
  XCircleIcon,            // For rejected status
  PauseCircleIcon,        // For on_hold status
  ArrowPathIcon,          // Loading spinner
  ExclamationCircleIcon,  // Error/Warning icon
  InboxStackIcon,         // For no applications state
} from '@heroicons/react/24/outline';

const BASE_URL = 'http://127.0.0.1:8000'; // Define your base URL

const TeacherApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const token = localStorage.getItem('access');

  const fetchApplications = async () => {
    setLoading(true);
    setUnauthorized(false);
    setErrors({});
    setSuccessMsg('');

    if (!token) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/admin/teacher-application/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Error fetching teacher applications:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUnauthorized(true);
      } else {
        setErrors({ general: 'Failed to load teacher applications. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setSubmittingId(id);
    setErrors({});
    setSuccessMsg('');

    const originalApplications = [...applications];
    const appToUpdateIndex = applications.findIndex(app => app.id === id);

    // Optimistic UI update
    if (appToUpdateIndex !== -1) {
      const updatedApps = [...applications];
      updatedApps[appToUpdateIndex] = { ...updatedApps[appToUpdateIndex], status: status };
      setApplications(updatedApps);
    }

    try {
      await axios.patch(`${BASE_URL}/api/admin/teacher-application/${id}/status/`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccessMsg(`Application status changed to ${status.replace(/_/g, ' ').toLowerCase()}ed successfully!`);
      // Optionally re-fetch after a short delay for full consistency
      // setTimeout(() => fetchApplications(), 1000);
    } catch (err) {
      console.error(`Error updating application status to ${status}:`, err.response?.data || err.message);
      setErrors(prev => ({
        ...prev,
        [`app_${id}_status`]: err.response?.data?.status?.[0] || err.response?.data?.detail || 'Update failed.',
        general: 'One or more updates failed. Check individual application errors.'
      }));
      // Rollback optimistic update
      setApplications(originalApplications);
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  // Helper function for status badge styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      case 'on_hold': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
      case 'pending':
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
    }
  };

  // Helper function for status badge icons
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4 mr-1" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4 mr-1" />;
      case 'on_hold': return <PauseCircleIcon className="h-4 w-4 mr-1" />;
      case 'pending':
      default: return <ClockIcon className="h-4 w-4 mr-1" />;
    }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-slate-900 rounded-lg shadow-lg max-w-2xl mx-auto mt-10 p-8">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-500" />
          <span>Loading teacher applications...</span>
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
        <AcademicCapIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <span>Teacher Applications</span>
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

      {applications.length === 0 && !loading && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <InboxStackIcon className="h-20 w-20 mx-auto mb-4" />
          <p className="text-lg">No teacher applications found at the moment.</p>
        </div>
      )}

      <div className="space-y-4">
        {applications.map(app => (
          <div
            key={app.id}
            className="relative p-5 rounded-xl shadow-md bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 transition-all duration-200 ease-in-out hover:scale-[1.01]"
          >
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 px-4 py-1.5 text-sm font-semibold rounded-full flex items-center ${getStatusStyle(app.status)}`}>
              {getStatusIcon(app.status)}
              {app.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>

            {/* Application Details */}
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p className="flex items-center text-lg font-semibold">
                <UserCircleIcon className="h-6 w-6 mr-3 text-indigo-500 dark:text-indigo-400" />
                Applicant: <span className="font-normal ml-2">{app.user}</span>
              </p>
              <p className="flex items-center text-base">
                <BookOpenIcon className="h-5 w-5 mr-3 text-purple-500 dark:text-purple-400" />
                Education: <span className="ml-2">{app.highest_education}</span>
              </p>
              <p className="flex items-center text-base">
                <LightBulbIcon className="h-5 w-5 mr-3 text-yellow-500 dark:text-yellow-400" />
                Skills: <span className="ml-2">{app.skills}</span>
              </p>
            </div>

            {/* Action Buttons: Visible for 'pending', 'on_hold', and 'rejected' applications */}
            {(app.status === 'pending' || app.status === 'on_hold' || app.status === 'rejected') && (
              <div className="flex flex-wrap gap-3 mt-5 justify-end">
                {/* Approve Button */}
                <button
                  onClick={() => updateStatus(app.id, 'approved')}
                  disabled={submittingId === app.id || app.status === 'approved'} // Disable if already approved or submitting
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {submittingId === app.id ? (
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                  )}
                  {submittingId === app.id ? 'Approving...' : 'Approve'}
                </button>

                {/* Reject Button */}
                <button
                  onClick={() => updateStatus(app.id, 'rejected')}
                  disabled={submittingId === app.id || app.status === 'rejected'} // Disable if already rejected or submitting
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {submittingId === app.id ? (
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 mr-2" />
                  )}
                  {submittingId === app.id ? 'Rejecting...' : 'Reject'}
                </button>

                {/* On Hold Button - Visible if currently 'pending' or 'rejected' */}
                {(app.status === 'pending' || app.status === 'rejected') && (
                  <button
                    onClick={() => updateStatus(app.id, 'on_hold')}
                    disabled={submittingId === app.id || app.status === 'on_hold'} // Disable if already on_hold or submitting
                    className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {submittingId === app.id ? (
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                    ) : (
                      <PauseCircleIcon className="h-5 w-5 mr-2" />
                    )}
                    {submittingId === app.id ? 'Holding...' : 'On Hold'}
                  </button>
                )}
              </div>
            )}

            {/* Individual Error for this application/action */}
            {errors[`app_${app.id}_status`] && (
              <p className="mt-3 text-red-500 text-xs w-full text-right">
                <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />{errors[`app_${app.id}_status`]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherApplications;