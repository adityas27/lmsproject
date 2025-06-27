// src/components/AddModuleContent.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  DocumentArrowUpIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PencilSquareIcon, // For title
  Bars3Icon, // For module type select
} from '@heroicons/react/24/outline'; // Make sure to install: npm install @heroicons/react

const BASE_URL = 'http://127.0.0.1:8000'; // Define your base URL

const AddModuleContent = () => {
  const { courseSlug, moduleSlug } = useParams();
  const navigate = useNavigate();

  // State for form fields - Added 'title' as per your ModuleContent model
  const [form, setForm] = useState({
    title: '', // New: Title for the content
    content_type: 'text',
    text: '', // This will now be always visible
    video_url: '',
    file: null,
    order: 0,
    is_required: false,
    duration: 0,
  });

  // State for UI/API interaction
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // For submit button loading state
  const [unauthorized, setUnauthorized] = useState(false);
  const [errors, setErrors] = useState({}); // To display API validation errors
  const [successMsg, setSuccessMsg] = useState(''); // To display success messages

  // Handles form field changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear specific field error on change

    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (type === 'file') {
      setForm({ ...form, file: files[0] });
    } else {
      // Ensure number inputs are parsed to numbers
      setForm({ ...form, [name]: type === 'number' ? Number(value) : value });
    }
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({}); // Clear previous errors
    setSuccessMsg(''); // Clear previous success messages

    const formData = new FormData();
    
    // Always append module slug and required fields
    formData.append('module', moduleSlug);
    formData.append('content_type', form.content_type);
    formData.append('order', form.order.toString()); // Ensure it's a string for FormData
    formData.append('is_required', form.is_required);

    // Append title (use default if empty, as per model's default)
    formData.append('title', form.title || 'Default Title for Content');

    // Text field is always available, append if it has content
    if (form.text) {
      formData.append('text', form.text);
    }

    // Conditionally append video_url or file based on content_type
    if (form.content_type === 'video' && form.video_url) {
      formData.append('video_url', form.video_url);
    }
    if (form.content_type === 'file' && form.file) {
      formData.append('file', form.file);
    }
    
    // Only append duration if it's greater than 0 (optional field)
    if (form.duration > 0) {
      formData.append('duration', form.duration.toString());
    }

    try {
      await axios.post(`${BASE_URL}/api/courses/contents/`, formData, {
        headers: {
          // 'Content-Type': 'multipart/form-data' is usually set automatically by axios for FormData
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setSuccessMsg('Content added successfully!');
      // Reset form to initial state after success
      setForm({
        title: '',
        content_type: 'text',
        text: '',
        video_url: '',
        file: null,
        order: 0,
        is_required: false,
        duration: 0,
      });
      // Also reset file input visually
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';

      // Optionally navigate back or to module details after a short delay
      // setTimeout(() => navigate(-1), 2000);

    } catch (err) {
      console.error('Failed to add content:', err.response?.data || err.message);
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

  // Effect hook to fetch course details for authorization check
  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setUnauthorized(false); // Reset unauthorized state

      try {
        const token = localStorage.getItem('access');
        if (!token) { // If no token, user is not authenticated
          setUnauthorized(true);
          return;
        }

        const response = await axios.get(`${BASE_URL}/api/courses/courses/${courseSlug}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if the current user is the author of the course
        if (!response.data.is_author) {
          setUnauthorized(true);
        } else {
          setCourse(response.data); // Store course data if authorized
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        // Treat any error during fetch as unauthorized to prevent access
        setUnauthorized(true);
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchCourse();
  }, [courseSlug]); // Re-run effect if courseSlug changes

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-slate-900 rounded-lg shadow-lg mx-auto mt-10 p-8">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-500" />
          <span>Loading authorization...</span>
        </div>
      </div>
    );
  }

  // Unauthorized state UI
  if (unauthorized) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8 bg-red-50 dark:bg-red-950 rounded-lg shadow-lg max-w-xl mx-auto mt-10 border border-red-200 dark:border-red-700">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-red-700 dark:text-red-300">
          <ExclamationCircleIcon className="h-12 w-12 text-red-600" />
          <span>Access Denied: You do not have permission to add content to this module.</span>
        </div>
      </div>
    );
  }

  // Main component rendering (form)
  return (
    <div className="bg-gray-50 dark:bg-slate-900 py-4 px-4">
    <div className="max-w-4xl mx-auto mt-10 p-6 sm:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700 font-sans antialiased">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white flex items-center justify-center space-x-3">
        <DocumentTextIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <span>Add Module Content</span>
      </h2>

      {/* Success Message Display */}
      {successMsg && (
        <div className="flex items-center justify-center p-3 mb-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700">
          <CheckCircleIcon className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}
      {/* General Error Message Display (e.g., non_field_errors or unauthorized API message) */}
      {errors.general && (
        <div className="flex items-center justify-center p-3 mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-700">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content Title</label>
          <div className="relative">
            <PencilSquareIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to React, Python Basics"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            />
          </div>
          {errors.title && <p className="mt-1 text-red-500 text-xs">{errors.title}</p>}
        </div>

        {/* Content Type Select */}
        <div>
          <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content Type</label>
          <div className="relative">
            <Bars3Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <select
              id="content_type"
              name="content_type"
              value={form.content_type}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            >
              <option value="text">Article (Text)</option>
              <option value="video">Video</option>
              <option value="file">Document (File)</option>
            </select>
          </div>
          {errors.content_type && <p className="mt-1 text-red-500 text-xs">{errors.content_type}</p>}
        </div>

        {/* Text Content - ALWAYS VISIBLE */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Text/Description (Optional)</label>
          <div className="relative">
            <DocumentTextIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <textarea
              id="text"
              name="text"
              value={form.text}
              onChange={handleChange}
              placeholder="Provide a detailed description, article content, or notes for the content."
              rows="6"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            />
          </div>
          {errors.text && <p className="mt-1 text-red-500 text-xs">{errors.text}</p>}
        </div>

        {/* Conditional Fields based on Content Type */}
        {form.content_type === 'video' && (
          <div>
            <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video URL (YouTube, Vimeo, etc.)</label>
            <div className="relative">
              <VideoCameraIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="url"
                id="video_url"
                name="video_url"
                value={form.video_url}
                onChange={handleChange}
                placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                required={form.content_type === 'video'} // Make required only for video type
              />
            </div>
            {errors.video_url && <p className="mt-1 text-red-500 text-xs">{errors.video_url}</p>}
          </div>
        )}

        {form.content_type === 'file' && (
          <div>
            <label htmlFor="file-upload-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Document/File</label>
            <div className="relative">
              <DocumentArrowUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="file"
                id="file-upload-input"
                name="file"
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800 transition duration-200"
                required={form.content_type === 'file'} // Make required only for file type
              />
            </div>
            {errors.file && <p className="mt-1 text-red-500 text-xs">{errors.file}</p>}
          </div>
        )}

        {/* Order and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
            <div className="relative">
              <ClipboardDocumentListIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="number"
                id="order"
                name="order"
                value={form.order}
                onChange={handleChange}
                placeholder="e.g., 1, 2, 3"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                min="0"
                required
              />
            </div>
            {errors.order && <p className="mt-1 text-red-500 text-xs">{errors.order}</p>}
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (in minutes, optional)</label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="number"
                id="duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g., 10 (minutes)"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                min="0"
              />
            </div>
            {errors.duration && <p className="mt-1 text-red-500 text-xs">{errors.duration}</p>}
          </div>
        </div>

        {/* Is Required Checkbox */}
        <div>
          <label htmlFor="is_required" className="flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            <input
              type="checkbox"
              id="is_required"
              name="is_required"
              checked={form.is_required}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-slate-700 dark:border-slate-600"
            />
            <span>Content is Required to Complete Module</span>
          </label>
          {errors.is_required && <p className="mt-1 text-red-500 text-xs">{errors.is_required}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl text-white font-semibold text-lg
                     bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800
                     transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-lg
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 space-x-2"
        >
          {submitting ? (
            <>
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-3 text-white" />
              <span>Adding Content...</span>
            </>
          ) : (
            <span>Add Content</span>
          )}
        </button>
      </form>
    </div>
    </div>
  );
};

export default AddModuleContent;