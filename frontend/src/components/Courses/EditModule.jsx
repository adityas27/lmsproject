import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PencilSquareIcon,       // For title
  DocumentTextIcon,       // For description
  ClipboardDocumentListIcon,        // For order
  CheckCircleIcon,        // For success message
  ExclamationCircleIcon,  // For error message
  ArrowPathIcon,          // For loading spinner
  ArrowUturnLeftIcon      // For back button/header
} from '@heroicons/react/24/outline'; // Make sure to install: npm install @heroicons/react

const BASE_URL = 'http://127.0.0.1:8000'; // Define your base URL

const EditModule = () => {
  const { slug } = useParams(); // Module slug
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0, // Initialize with 0 or a sensible default
    is_published: false, // Initialize with false
  });

  // State for UI/API interaction
  const [loading, setLoading] = useState(true); // Initial loading for data fetch
  const [submitting, setSubmitting] = useState(false); // For update button loading state
  const [unauthorized, setUnauthorized] = useState(false); // For authorization status
  const [moduleNotFound, setModuleNotFound] = useState(false); // If module doesn't exist
  const [errors, setErrors] = useState({}); // To display API validation errors
  const [successMsg, setSuccessMsg] = useState(''); // To display success messages

  // Handles form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear specific field error on change

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }));
  };

  // Effect hook to fetch module details and perform authorization
  useEffect(() => {
    const fetchModule = async () => {
      setLoading(true);
      setUnauthorized(false);
      setModuleNotFound(false);
      setErrors({}); // Clear any previous errors

      try {
        const token = localStorage.getItem('access');
        if (!token) {
          setUnauthorized(true);
          return;
        }

        // 1. Fetch Module Details
        const moduleResponse = await axios.get(`${BASE_URL}/api/courses/modules/${slug}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Backend module_detail view should already check has_object_permission,
        // so if this succeeds, the user is authorized to view this module.
        // It should also return course_slug for the frontend auth check.
        const moduleData = moduleResponse.data;

        setFormData({
          title: moduleData.title || '',
          description: moduleData.description || '',
          order: moduleData.order || 0,
          is_published: moduleData.is_published,
        });

        // 2. Further check if user is author of the COURSE the module belongs to
        //    (This assumes moduleResponse.data.course_slug is available from the serializer)
        if (moduleData.course) {
            const courseResponse = await axios.get(`${BASE_URL}/api/courses/courses/${moduleData.course}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!courseResponse.data.is_author) {
                setUnauthorized(true);
            }
        } else {
            // If module doesn't have a course_slug, something is wrong or
            // the module is malformed. Treat as unauthorized.
            setUnauthorized(true);
        }

      } catch (error) {
        console.error('Error fetching module or checking authorization:', error);
        if (error.response?.status === 404) {
          setModuleNotFound(true);
        } else if (error.response?.status === 403 || error.response?.status === 401) {
          setUnauthorized(true);
        } else {
          setErrors({ general: 'Failed to load module. Please try again.' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [slug]); // Re-run effect if module slug changes

  // Handles form submission for update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({}); // Clear previous errors
    setSuccessMsg(''); // Clear previous success messages

    try {
      await axios.put(
        `${BASE_URL}/api/courses/modules/${slug}/`,
        formData, // Send all relevant formData for update
        { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
      );
      setSuccessMsg('Module updated successfully!');
      // No form reset for edit forms, just show success and navigate back
      setTimeout(() => navigate(-1), 1500); // Navigate back after a short delay

    } catch (err) {
      console.error('Error updating module:', err.response?.data || err.message);
      if (err.response && err.response.data) {
        setErrors(err.response.data); // Set API validation errors
        // Handle non-field errors or general messages
        if (err.response.data.detail) {
            setErrors(prev => ({ ...prev, general: err.response.data.detail }));
        } else if (err.response.data.non_field_errors) {
            setErrors(prev => ({ ...prev, general: err.response.data.non_field_errors[0] }));
        }
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setSubmitting(false); // End submitting state
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-slate-900 rounded-lg shadow-lg max-w-xl mx-auto mt-10 p-8">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-500" />
          <span>Loading module details...</span>
        </div>
      </div>
    );
  }

  if (moduleNotFound) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8 bg-red-50 dark:bg-red-950 rounded-lg shadow-lg max-w-xl mx-auto mt-10 border border-red-200 dark:border-red-700">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-red-700 dark:text-red-300">
          <ExclamationCircleIcon className="h-12 w-12 text-red-600" />
          <span>Module Not Found.</span>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowUturnLeftIcon className="-ml-0.5 mr-2 h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
       
      <div className="min-h-[400px] flex items-center justify-center p-8 bg-red-50 dark:bg-red-950 rounded-lg shadow-lg max-w-xl mx-auto mt-10 border border-red-200 dark:border-red-700">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-red-700 dark:text-red-300">
          <ExclamationCircleIcon className="h-12 w-12 text-red-600" />
          <span>Access Denied: You do not have permission to edit this module.</span>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowUturnLeftIcon className="-ml-0.5 mr-2 h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 py-4 px-4">
    <div className="max-w-2xl mx-auto mt-10 p-6 sm:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700 font-sans antialiased">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white flex items-center justify-center space-x-3">
        <PencilSquareIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        <span>Edit Module</span>
      </h2>

      {/* Success Message Display */}
      {successMsg && (
        <div className="flex items-center justify-center p-3 mb-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700">
          <CheckCircleIcon className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}
      {/* General Error Message Display (e.g., non_field_errors or general API message) */}
      {errors.general && (
        <div className="flex items-center justify-center p-3 mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-700">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module Title</label>
          <div className="relative">
            <PencilSquareIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to Programming"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            />
          </div>
          {errors.title && <p className="mt-1 text-red-500 text-xs">{errors.title}</p>}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <div className="relative">
            <DocumentTextIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a brief overview of the module content."
              rows="4"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            />
          </div>
          {errors.description && <p className="mt-1 text-red-500 text-xs">{errors.description}</p>}
        </div>

        {/* Order Field */}
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
          <div className="relative">
            <ClipboardDocumentListIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              placeholder="e.g., 1, 2, 3"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              min="1"
              required
            />
          </div>
          {errors.order && <p className="mt-1 text-red-500 text-xs">{errors.order}</p>}
        </div>

        {/* Publish Module Checkbox */}
        <div>
          <label htmlFor="is_published" className="flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-slate-700 dark:border-slate-600"
            />
            <span>Publish Module</span>
          </label>
          {errors.is_published && <p className="mt-1 text-red-500 text-xs">{errors.is_published}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl text-white font-semibold text-lg
                     bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800
                     transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-lg
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 space-x-2"
        >
          {submitting ? (
            <>
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-3 text-white" />
              <span>Updating Module...</span>
            </>
          ) : (
            <span>Update Module</span>
          )}
        </button>

        {/* Go Back Button (optional, can also be handled by navigate(-1) after success) */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold text-lg
                     bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600
                     transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 space-x-2 mt-4"
        >
          <ArrowUturnLeftIcon className="-ml-0.5 mr-2 h-5 w-5" />
          <span>Cancel & Go Back</span>
        </button>
      </form>
    </div>
    </div>
  );
};

export default EditModule;