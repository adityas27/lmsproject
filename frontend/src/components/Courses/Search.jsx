import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MagnifyingGlassIcon,    // Search icon
  AcademicCapIcon,       // Level icon
  TagIcon,               // Category icon
  CurrencyRupeeIcon,     // Price icon
  ArrowsUpDownIcon,      // Ordering icon (Corrected from ArrowDownUpIcon, common alias in Heroicons)
  BookOpenIcon,          // Course card & header icon
  StarIcon,              // Rating icon
  UserIcon,              // Author icon
  ArrowPathIcon,         // Loading spinner
  ExclamationCircleIcon, // Error icon
  FaceFrownIcon,         // No courses found icon
} from '@heroicons/react/24/outline';

const BASE_URL = 'http://127.0.0.1:8000'; // Define your base URL

const CourseSearchFilter = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [ordering, setOrdering] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const availableCategories = [
    'Programming', 'Design', 'Marketing', 'Business', 'Photography', 'Music', 'Health & Fitness', 'Development'
  ];

  const fetchCourses = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        search,
        level: level || undefined,
        category: category || undefined,
        price_min: priceRange[0] > 0 ? priceRange[0] : undefined,
        price_max: priceRange[1] < 5000 ? priceRange[1] : undefined,
        ordering: ordering || undefined,
      };

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const res = await axios.get(`${BASE_URL}/api/courses/courses/`, { params });
      setCourses(res.data);
      console.log('Fetched courses:', res.data);
    } catch (err) {
      console.error('Failed to fetch courses', err.response?.data || err.message);
      setError('Failed to load courses. Please try adjusting your filters or try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search, level, category, priceRange, ordering]);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-slate-900 font-sans antialiased">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white flex items-center justify-center space-x-3">
          <BookOpenIcon className="h-9 w-9 text-indigo-600 dark:text-indigo-400" />
          <span>Find Courses</span>
        </h2>

        {/* Filters Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Search Input */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-2 border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search courses..."
                className="flex-grow bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Level Select */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-2 border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500">
              <AcademicCapIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
              <select
                // FIX: Apply direct background color to select for better option visibility
                className="flex-grow bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none appearance-none cursor-pointer"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">All Levels</option>
                <option value="beginner" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">Beginner</option>
                <option value="intermediate" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">Intermediate</option>
                <option value="advanced" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">Advanced</option>
              </select>
            </div>

            {/* Category Select */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-2 border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500">
              <TagIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
              <select
                // FIX: Apply direct background color to select for better option visibility
                className="flex-grow bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none appearance-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">All Categories</option>
                {availableCategories.map((cat, index) => (
                  <option key={index} value={cat.toLowerCase()} className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordering Select */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-2 border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500">
              {/* Corrected icon name: ArrowsUpDownIcon is typically used for sorting */}
              <ArrowsUpDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
              <select
                // FIX: Apply direct background color to select for better option visibility
                className="flex-grow bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none appearance-none cursor-pointer"
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
              >
                <option value="" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">Sort By</option>
                <option value="price" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">Price (Low &rarr; High)</option>
                <option value="-price" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">Price (High &rarr; Low)</option>
                <option value="-created_at" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">Newest First</option>
                <option value="-rating" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white">Top Rated</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="col-span-full md:col-span-2 lg:col-span-2 xl:col-span-2 flex flex-wrap items-center gap-3 bg-gray-100 dark:bg-slate-700 rounded-lg p-3 border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500">
              <CurrencyRupeeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Price Range:</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900 dark:text-white">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  className="w-24 p-2 bg-gray-200 dark:bg-slate-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                />
              </div>
              <span className="text-gray-700 dark:text-gray-300">to</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900 dark:text-white">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-24 p-2 bg-gray-200 dark:bg-slate-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Course List Section */}
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center py-10 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700">
            <div className="flex flex-col items-center space-y-4 text-lg font-medium text-gray-700 dark:text-gray-300">
              <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-500" />
              <span>Loading courses...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-700">
            <ExclamationCircleIcon className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700">
            <FaceFrownIcon className="h-20 w-20 mx-auto mb-4" />
            <p className="text-lg">No courses found matching your criteria.</p>
            <p className="text-sm mt-2">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.slug || course.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                    {course.author_name}
                  </p>
                  <p className="flex items-center">
                    <AcademicCapIcon className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs font-medium">
                      {course.level}
                    </span>
                  </p>
                  {course.category && (
                    <p className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-1 text-purple-500" />
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 text-xs font-medium">
                        {course.category}
                      </span>
                    </p>
                  )}
                  <p className="flex items-center">
                    <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                    {course.rating ? course.rating.toFixed(1) : 'N/A'}
                  </p>
                  <p className="flex items-center font-bold text-lg text-green-700 dark:text-green-400 mt-2 w-full">
                    <CurrencyRupeeIcon className="h-5 w-5 mr-1" />
                    {course.price === 0 ? 'Free' : course.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSearchFilter;