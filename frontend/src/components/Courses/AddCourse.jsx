import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpenIcon,
  PencilSquareIcon,
  CurrencyRupeeIcon,
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon,
  PhotoIcon,
  CheckCircleIcon,
  LightBulbIcon, // For is_published
  DocumentCheckIcon, // For auto_certificate
  TagIcon, // For tags
  Bars3BottomLeftIcon, // For category
  ArrowDownCircleIcon, // For subcategory
  PlusCircleIcon, // For form title
  ArrowPathIcon, // For submitting state
  ExclamationCircleIcon // For error messages
} from '@heroicons/react/24/outline'; // Using outline for most icons

// Define your API base URL
const BASE_URL = 'http://127.0.0.1:8000';

const AddCourseForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '', // Assuming 'price' is intended to be a field
    launch_date: '',
    duration: '',
    level: 'beginner',
    thumbnail: null, // For file input
    is_published: false,
    auto_certificate: true, // Common default
    category: '', // Store category slug
    subcategory: '', // Store subcategory slug
    tags: [], // Store tag IDs
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [allTags, setAllTags] = useState([]); // All available tags
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true); // For initial data fetch (user, categories, tags)
  const [submitting, setSubmitting] = useState(false); // For form submission
  const [userIsTeacher, setUserIsTeacher] = useState(false);
  const [fetchError, setFetchError] = useState(''); // For initial fetch errors

  // Fetch initial data: user status, categories, and tags
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const token = localStorage.getItem('access');
        if (!token) {
          setFetchError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch user status
        const userRes = await axios.get(`${BASE_URL}/api/accounts/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserIsTeacher(userRes.data.is_teacher);

        if (!userRes.data.is_teacher) {
          setFetchError("You must be a teacher to create a course.");
          setLoading(false);
          return;
        }

        // Fetch categories
        const categoriesRes = await axios.get(`${BASE_URL}/api/courses/categories/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(categoriesRes.data);

        // Fetch tags
        const tagsRes = await axios.get(`${BASE_URL}/api/courses/tags/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllTags(tagsRes.data);

      } catch (err) {
        console.error('Error fetching initial data:', err);
        setFetchError('Failed to load necessary data for the form. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const fetchSubcategories = async () => {
        try {
          const token = localStorage.getItem('access');
          const res = await axios.get(`${BASE_URL}/api/courses/categories/${formData.category}/subcategories/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSubcategories(res.data);
        } catch (err) {
          console.error('Error fetching subcategories:', err);
          setErrors(prev => ({ ...prev, subcategory: 'Failed to load subcategories.' }));
        }
      };
      fetchSubcategories();
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: '' })); // Reset subcategory if category is cleared
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setErrors({ ...errors, [name]: '' }); // Clear individual field error

    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTagChange = (e) => {
    const { options } = e.target;
    const selectedOptions = Array.from(options).filter(option => option.selected);
    const selectedTagIds = selectedOptions.map(option => option.value); // Assuming value is tag ID
    setFormData(prev => ({ ...prev, tags: selectedTagIds }));
    setErrors({ ...errors, tags: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg('');
    setSubmitting(true);

    const data = new FormData();
    for (const key in formData) {
      if (key === 'thumbnail' && formData.thumbnail) {
        data.append(key, formData.thumbnail);
      } else if (key === 'tags') {
        // Append each tag ID individually, or as a comma-separated string if your backend expects that
        formData.tags.forEach(tagId => data.append('tags', tagId));
      } else if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    }

    try {
      await axios.post(`${BASE_URL}/api/courses/courses/`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
          // 'Content-Type': 'multipart/form-data' is typically set automatically by browser for FormData
        },
      });
      setSuccessMsg('Course created successfully!');
      // Reset form fields
      setFormData({
        name: '',
        description: '',
        price: '',
        launch_date: '',
        duration: '',
        level: 'beginner',
        thumbnail: null,
        is_published: false,
        auto_certificate: true,
        category: '',
        subcategory: '',
        tags: [],
      });
      // Clear file input visually (if you have a ref for it)
      document.getElementById('thumbnail').value = '';

    } catch (error) {
      console.error('Error creating course:', error.response?.data || error.message);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
        if (error.response.data.detail) { // Handle general DRF errors
            setErrors(prev => ({ ...prev, general: error.response.data.detail }));
        } else if (error.response.data.non_field_errors) { // Handle non-field errors
            setErrors(prev => ({ ...prev, general: error.response.data.non_field_errors[0] }));
        }
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-slate-900 rounded-lg shadow-lg max-w-xl mx-auto mt-10 p-8">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-500" />
          <span>Loading form data...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8 bg-red-50 dark:bg-red-950 rounded-lg shadow-lg max-w-xl mx-auto mt-10 border border-red-200 dark:border-red-700">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-red-700 dark:text-red-300">
          <ExclamationCircleIcon className="h-12 w-12 text-red-600" />
          <span>{fetchError}</span>
        </div>
      </div>
    );
  }

  if (!userIsTeacher) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8 bg-orange-50 dark:bg-orange-950 rounded-lg shadow-lg max-w-xl mx-auto mt-10 border border-orange-200 dark:border-orange-700">
        <div className="flex flex-col items-center space-y-4 text-lg font-medium text-orange-700 dark:text-orange-300">
          <ExclamationCircleIcon className="h-12 w-12 text-orange-600" />
          <span>Access Denied: Only teachers can create courses.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 sm:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700 font-sans antialiased">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white flex items-center justify-center space-x-3">
        <PlusCircleIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <span>Create a New Course</span>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Name</label>
          <div className="relative">
            <BookOpenIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              required
            />
          </div>
          {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <div className="relative">
            <PencilSquareIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              required
            ></textarea>
          </div>
          {errors.description && <p className="mt-1 text-red-500 text-xs">{errors.description}</p>}
        </div>

        {/* Price and Duration (side by side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
            <div className="relative">
              <CurrencyRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                min="0"
                required
              />
            </div>
            {errors.price && <p className="mt-1 text-red-500 text-xs">{errors.price}</p>}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (in hours)</label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                min="1"
                required
              />
            </div>
            {errors.duration && <p className="mt-1 text-red-500 text-xs">{errors.duration}</p>}
          </div>
        </div>

        {/* Launch Date and Level (side by side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Launch Date */}
          <div>
            <label htmlFor="launch_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Launch Date</label>
            <div className="relative">
              <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="date"
                id="launch_date"
                name="launch_date"
                value={formData.launch_date}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                required
              />
            </div>
            {errors.launch_date && <p className="mt-1 text-red-500 text-xs">{errors.launch_date}</p>}
          </div>

          {/* Level */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
            <div className="relative">
              <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            {errors.level && <p className="mt-1 text-red-500 text-xs">{errors.level}</p>}
          </div>
        </div>

        {/* Category and Subcategory (side by side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <div className="relative">
              <Bars3BottomLeftIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            {errors.category && <p className="mt-1 text-red-500 text-xs">{errors.category}</p>}
          </div>

          {/* Subcategory */}
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subcategory</label>
            <div className="relative">
              <ArrowDownCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                disabled={!formData.category || subcategories.length === 0} // Disable if no category or no subcategories
                required
              >
                <option value="">Select a subcategory</option>
                {subcategories.map(subcat => (
                  <option key={subcat.slug} value={subcat.slug}>{subcat.name}</option>
                ))}
              </select>
            </div>
            {errors.subcategory && <p className="mt-1 text-red-500 text-xs">{errors.subcategory}</p>}
          </div>
        </div>

        {/* Tags (Multi-select) */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (Ctrl/Cmd + Click to select multiple)</label>
          <div className="relative">
            <TagIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <select
              id="tags"
              name="tags"
              multiple
              value={formData.tags}
              onChange={handleTagChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 h-32" // h-32 for better visibility for multiple options
            >
              {allTags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
          {errors.tags && <p className="mt-1 text-red-500 text-xs">{errors.tags}</p>}
        </div>

        {/* Thumbnail */}
        <div>
          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Thumbnail</label>
          <div className="relative">
            <PhotoIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              accept="image/*"
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800 transition duration-200"
            />
          </div>
          {errors.thumbnail && <p className="mt-1 text-red-500 text-xs">{errors.thumbnail}</p>}
        </div>

        {/* Checkboxes (Is Published, Auto Certificate) */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center">
            <input
              id="is_published"
              type="checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-slate-700 dark:border-slate-600"
            />
            <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Publish Course Immediately
            </label>
          </div>
          {errors.is_published && <p className="mt-1 text-red-500 text-xs">{errors.is_published}</p>}

          <div className="flex items-center">
            <input
              id="auto_certificate"
              type="checkbox"
              name="auto_certificate"
              checked={formData.auto_certificate}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-slate-700 dark:border-slate-600"
            />
            <label htmlFor="auto_certificate" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Enable Automatic Certificate Generation
            </label>
          </div>
          {errors.auto_certificate && <p className="mt-1 text-red-500 text-xs">{errors.auto_certificate}</p>}
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
              <span>Creating Course...</span>
            </>
          ) : (
            <span>Create Course</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddCourseForm;