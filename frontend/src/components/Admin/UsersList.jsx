import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  UsersIcon,             // Main header icon for users
  CheckCircleIcon,      // Success icon
  ExclamationCircleIcon, // Error/Warning icon
  ArrowPathIcon,        // Loading spinner
  UserGroupIcon,        // For semi-admin status
  ShieldCheckIcon,      // For teacher status
  XMarkIcon,              // For banned status
  UserCircleIcon        // Generic user icon
} from '@heroicons/react/24/outline'; // Make sure to install: npm install @heroicons/react

const BASE_URL = 'http://127.00.1:8000'; // Define your base URL

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submittingId, setSubmittingId] = useState(null); // To track which user's action is pending
  const [unauthorized, setUnauthorized] = useState(false); // For admin access permission
  const [errors, setErrors] = useState({}); // General and action-specific errors
  const [successMsg, setSuccessMsg] = useState(''); // Success messages

  const token = localStorage.getItem('access');

  const fetchUsers = async () => {
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
      const res = await axios.get(`${BASE_URL}/api/admin/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUnauthorized(true);
      } else {
        setErrors({ general: 'Failed to load users. Please try again.' });
      }
    } finally {
      setLoadingList(false);
    }
  };

  const toggleField = async (id, field) => {
    setSubmittingId(id);
    setErrors({}); // Clear previous errors
    setSuccessMsg(''); // Clear previous success messages

    const userToUpdate = users.find(u => u.id === id);
    if (!userToUpdate) {
      setErrors({ general: 'User not found for update.' });
      setSubmittingId(null);
      return;
    }

    const payload = { [field]: !userToUpdate[field] };

    try {
      // Optimistic update for quicker UI response
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === id ? { ...user, [field]: !user[field] } : user
        )
      );

      await axios.put(`${BASE_URL}/api/admin/users/${id}/update/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccessMsg(`${field === 'is_banned' ? 'Ban status' : 'Semi-admin status'} updated for ${userToUpdate.username}.`);
      // If the backend returns the updated user, you might want to use res.data to set users
      // If not, re-fetching is safer after a successful update.
      // For this example, optimistic update + re-fetch on error is a good balance.
      // fetchUsers(); // Uncomment if you prefer full re-fetch after every successful toggle
    } catch (err) {
      console.error(`Error toggling ${field} for user ${id}:`, err.response?.data || err.message);
      // Revert optimistic update on error
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === id ? { ...user, [field]: userToUpdate[field] } : user
        )
      );
      if (err.response && err.response.data) {
        setErrors(prev => ({
          ...prev,
          [`user_${id}_${field}`]: err.response.data.detail || err.response.data.non_field_errors?.[0] || 'Update failed.',
          general: 'One or more updates failed. Check individual user errors.'
        }));
      } else {
        setErrors(prev => ({ ...prev, general: 'An unexpected error occurred during update.' }));
      }
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => { fetchUsers(); }, []); 

  if (loadingList) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-slate-900 rounded-lg shadow-lg max-w-2xl mx-auto mt-10 p-8">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-500" />
          <span>Loading users...</span>
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
        <UsersIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <span>All Users (Admin Panel)</span>
      </h2>

      {successMsg && (
        <div className="flex items-center justify-center p-3 mb-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700">
          <CheckCircleIcon className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {errors.general && (
        <div className="flex items-center justify-center p-3 mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-700">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">{errors.general}</p>
        </div>
      )}

      {users.length === 0 && !loadingList && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <UserCircleIcon className="h-20 w-20 mx-auto mb-4" />
          <p className="text-lg">No users found.</p>
        </div>
      )}

      <div className="space-y-4">
        {users.map(user => (
          <div
            key={user.id}
            className={`p-5 rounded-xl shadow-md transition-all duration-300 ease-in-out
                       ${user.is_banned ? 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700' : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'}
                       flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}
          >
            <div className="flex flex-col">
              <p className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                {user.username}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 ml-8">{user.email}</p>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-3 ml-8">
                <span className="flex items-center gap-1">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-500" /> Teacher: {user.is_teacher ? 'Yes' : 'No'}
                </span>
                <span className={`flex items-center gap-1 ${user.is_semi_admin ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <UserGroupIcon className="h-4 w-4" /> Semi-Admin: {user.is_semi_admin ? 'Yes' : 'No'}
                </span>
                <span className={`flex items-center gap-1 ${user.is_banned ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  <XMarkIcon className="h-4 w-4" /> Banned: {user.is_banned ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 sm:ml-auto">
              {/* Ban/Unban Button */}
              <button
                onClick={() => toggleField(user.id, 'is_banned')}
                disabled={submittingId === user.id}
                className={`flex items-center px-4 py-2 rounded-full text-white text-sm font-medium transition-all duration-200 ease-in-out
                           ${user.is_banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {submittingId === user.id ? (
                  <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                ) : user.is_banned ? (
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                ) : (
                  <XMarkIcon className="h-4 w-4 mr-2" />
                )}
                {submittingId === user.id ? 'Updating...' : (user.is_banned ? 'Unban User' : 'Ban User')}
              </button>

              {/* Semi-Admin Toggle Button */}
              {user.is_semi_admin !== undefined && ( // Only show if field exists
                <button
                  onClick={() => toggleField(user.id, 'is_semi_admin')}
                  disabled={submittingId === user.id}
                  className={`flex items-center px-4 py-2 rounded-full text-white text-sm font-medium transition-all duration-200 ease-in-out
                             ${user.is_semi_admin ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'}
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none`}
                >
                  {submittingId === user.id ? (
                    <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                  ) : user.is_semi_admin ? (
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                  )}
                  {submittingId === user.id ? 'Updating...' : (user.is_semi_admin ? 'Revoke Semi-Admin' : 'Make Semi-Admin')}
                </button>
              )}
            </div>

            {/* Individual Error for this user/action */}
            {errors[`user_${user.id}_is_banned`] && (
              <p className="mt-2 text-red-500 text-xs w-full sm:w-auto sm:ml-auto">
                <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />{errors[`user_${user.id}_is_banned`]}
              </p>
            )}
            {errors[`user_${user.id}_is_semi_admin`] && (
              <p className="mt-2 text-red-500 text-xs w-full sm:w-auto sm:ml-auto">
                <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />{errors[`user_${user.id}_is_semi_admin`]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUserList;