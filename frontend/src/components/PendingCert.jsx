import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ClockIcon, // For pending status or general requests
  CheckCircleIcon, // For approved status
  XCircleIcon, // For rejected status
  UserIcon, // For student name
  BookOpenIcon, // For course title
  ChartBarIcon, // For progress
  CalendarIcon, // For applied date
  ClipboardDocumentCheckIcon, // For main title icon
  CubeTransparentIcon, // For loading state
  ExclamationCircleIcon, // For error state
  InboxIcon // For no requests state
} from '@heroicons/react/24/outline'; // Using outline for most icons


const BASE_URL = 'http://127.0.0.1:8000'; // Ensure this matches your Django backend URL

const PendingCertificates = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // To disable buttons during action

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }
      const res = await axios.get(`${BASE_URL}/api/courses/certificates/pending/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching pending certificates:', err);
      setError('Failed to load certificate requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id); // Disable buttons for this specific request
    try {
      await axios.post(`${BASE_URL}/api/courses/certificates/${action}/${id}/`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      });
      // Optionally, show a toast notification here instead of alert
      alert(`Request ${action}ed successfully!`);
      fetchPending(); // Refresh list to reflect changes
    } catch (err) {
      console.error(`Error ${action}ing certificate:`, err);
      // Optionally, show an error toast notification
      alert(`Failed to ${action} certificate. Please try again.`);
      setError(`Failed to ${action} certificate.`); // Set a general error or more specific
    } finally {
      setActionLoading(null); // Re-enable buttons
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 mr-1" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 mr-1" />;
      case 'pending':
      default:
        return <ClockIcon className="h-4 w-4 mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-900 rounded-lg max-w-6xl mx-auto mt-6">
        <CubeTransparentIcon className="animate-spin h-12 w-12 text-indigo-500" />
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading certificate requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-950 rounded-lg max-w-6xl mx-auto mt-6 border border-red-200 dark:border-red-700">
        <ExclamationCircleIcon className="h-12 w-12 text-red-600" />
        <p className="mt-4 text-lg font-medium text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={fetchPending}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-900 rounded-lg max-w-6xl mx-auto mt-6">
        <InboxIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">No pending certificate requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center flex items-center justify-center space-x-3">
          <ClipboardDocumentCheckIcon className="h-9 w-9 text-indigo-600 dark:text-indigo-400" />
          <span>Pending Certificate Requests</span>
        </h2>

        <div className="flex flex-col gap-6">
          {requests.map(req => (
            <div
              key={req.id}
              className="relative w-full p-6 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg bg-white dark:bg-slate-800 transition-transform duration-200 hover:scale-[1.01]"
            >
              {/* Status Badge */}
              <div className={`absolute top-4 right-4 px-4 py-1.5 text-sm font-semibold rounded-full flex items-center ${getStatusStyle(req.status)}`}>
                {getStatusIcon(req.status)}
                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
              </div>

              {/* Card Content */}
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p className="flex items-center text-lg font-semibold">
                  <UserIcon className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
                  <span>Student: <span className="font-normal">{req.student_name}</span> (<span className="font-normal">{req.student_email}</span>)</span>
                </p>
                <p className="flex items-center text-lg font-semibold">
                  <BookOpenIcon className="h-5 w-5 mr-3 text-purple-500 dark:text-purple-400" />
                  <span>Course: <span className="font-normal">{req.course_title}</span></span>
                </p>
                <p className="flex items-center text-lg font-semibold">
                  <ChartBarIcon className="h-5 w-5 mr-3 text-teal-500 dark:text-teal-400" />
                  <span>Progress: <span className="font-normal">{req.progress}%</span></span>
                </p>
                <p className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-3 text-orange-500 dark:text-orange-400" />
                  <span>Applied: <span className="font-normal">{new Date(req.applied_at).toLocaleString()}</span></span>
                </p>
              </div>

              {req.status === 'pending' && (
                <div className="mt-5 flex gap-4 justify-end"> {/* Align buttons to the right */}
                  <button
                    onClick={() => handleAction(req.id, 'approve')}
                    disabled={actionLoading === req.id}
                    className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === req.id ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    disabled={actionLoading === req.id}
                    className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === req.id ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PendingCertificates;