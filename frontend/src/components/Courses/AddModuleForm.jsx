import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Removed Navigate as it's not used directly here
import axios from 'axios';
import {
  PencilSquareIcon, // For title
  DocumentTextIcon, // For description
  ClipboardDocumentListIcon, // For order
  CheckCircleIcon, // For success message
  ExclamationCircleIcon, // For error message
  ArrowPathIcon, // For loading spinner
  PlusCircleIcon // For main header icon
} from '@heroicons/react/24/outline'; // Make sure to install: npm install @heroicons/react

const BASE_URL = 'http://127.0.0.1:8000'; // Define your base URL

const AddModuleForm = () => {
  const { slug } = useParams(); // course slug
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    is_published: true,
  });

  // State for UI/API interaction
  const [course, setCourse] = useState(null); // Not strictly needed for rendering, but for authorization check
  const [loading, setLoading] = useState(true); // Initial loading for auth check
  const [submitting, setSubmitting] = useState(false); // For submit button loading state
  const [unauthorized, setUnauthorized] = useState(false); // For authorization status
  const [errors, setErrors] = useState({}); // To display API validation errors
  const [successMsg, setSuccessMsg] = useState(''); // To display success messages

  // Handles form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear specific field error on change

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({}); // Clear previous errors
    setSuccessMsg(''); // Clear previous success messages

    try {
      await axios.post(
        `${BASE_URL}/api/courses/modules/`,
        { ...formData, course: slug }, // Send course slug along with form data
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        }
      );
      setSuccessMsg('Module added successfully!');
      // Reset form fields after successful submission
      setFormData({
        title: '',
        description: '',
        order: 1,
        is_published: true,
      });
      // Optionally navigate after a short delay
      // setTimeout(() => navigate(`/courses/${slug}`), 2000);

    } catch (error) {
      console.error('Error adding module:', error.response?.data || error.message);
      if (error.response && error.response.data) {
        setErrors(error.response.data); // Set API validation errors
        // Handle non-field errors or general messages
        if (error.response.data.detail) {
            setErrors(prev => ({ ...prev, general: error.response.data.detail }));
        } else if (error.response.data.non_field_errors) {
            setErrors(prev => ({ ...prev, general: error.response.data.non_field_errors[0] }));
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
        
        const response = await axios.get(`${BASE_URL}/api/courses/courses/${slug}/`, {
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
  }, [slug]); // Re-run effect if course slug changes

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-slate-900 rounded-lg shadow-lg max-w-xl mx-auto mt-10 p-8">
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
          <span>Access Denied: You do not have permission to add modules to this course.</span>
        </div>
      </div>
    );
  }

  // Main component rendering (form)
  return (
     <div className="bg-gray-50 dark:bg-slate-900 py-11 px-4">
    <div className="max-w-2xl mx-auto mt-10 p-6 sm:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700 font-sans antialiased">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white flex items-center justify-center space-x-3">
        <PlusCircleIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        <span>Add New Module</span>
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
              min="1" // Modules usually start from 1
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
            <span>Publish Module Immediately</span>
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
              <span>Creating Module...</span>
            </>
          ) : (
            <span>Create Module</span>
          )}
        </button>
      </form>
    </div>
    </div>
  );
};

export default AddModuleForm;