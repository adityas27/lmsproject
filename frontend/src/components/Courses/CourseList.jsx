import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { BookOpenIcon, InformationCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Courselist = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const coursesApiUrl = 'http://127.0.0.1:8000/api/courses/courses/'; 

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('access');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const response = await axios.get(coursesApiUrl, { headers });
      setCourses(response.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);
  // Handle click on the search bar
  const handleSearchBarClick = () => {
    navigate('/search'); // Navigate directly to the search page
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"> {/* Consistent with CourseDetailPage bg */}
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> {/* Indigo spinner */}
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading courses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-red-600 dark:text-red-400"> {/* Consistent bg */}
        <div className="flex items-center space-x-3 text-lg font-medium">
          <InformationCircleIcon className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="py-6 px-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl flex items-center border border-gray-100 dark:border-gray-800"> {/* Consistent border */}
          <BookOpenIcon className="h-8 w-8 mr-4 text-indigo-500" /> {/* Indigo icon */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Our Course Catalog
          </h1>
        </div>
      {/* Search Bar acting as a button */}
        <div
          onClick={handleSearchBarClick} // Click handler for navigation
          className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden px-4 py-2
                     cursor-pointer hover:shadow-xl transition-shadow duration-200 ease-in-out" // Added cursor and hover effects
        >
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mr-3" />
          {/* Input is now read-only and serves as a visual placeholder */}
          <input
            type="text"
            placeholder="Search all courses..."
            readOnly // Make the input not editable
            className="flex-grow bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg py-1
                       cursor-pointer" // Keep cursor-pointer on input too
          />
          {/* Removed the explicit search button */}
        </div>
        {/* Course Grid - Now a Flexbox with wrapping! */}
        {courses.length > 0 ? (
          <div className="flex flex-wrap gap-6 justify-center"> {/* Changed to flex, flex-wrap, added gap, and justify-center */}
            {courses.map(course => (
              <div
                key={course.id}
                className="flex-shrink-0 flex-grow-0
                           sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(33.33%-1rem)]
                           bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl
                           border border-gray-200 dark:border-gray-700 overflow-hidden
                           transform hover:scale-[1.02] transition duration-300 ease-in-out flex flex-col"
              >
                {/* Course Image Placeholder */}
                <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={course.thumbnail || `https://placehold.co/600x400/E0F2F7/264653?text=Course+Thumbnail`} 
                    alt={`Thumbnail for ${course.name}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E0F2F7/264653?text=Course+Thumbnail'; }}
                  />
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
                    {course.name}
                  </h3>
                  {course.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3">
                      {course.description}
                    </p>
                  )}
                  <Link
                    to={`/courses/${course.slug}`} // URL untouched
                    className="mt-auto block text-center
                               bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700
                               text-white font-semibold py-2.5 px-4 rounded-xl
                               transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md text-base
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50" // Consistent button style (Indigo)
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl min-h-[400px] border border-gray-100 dark:border-gray-800"> {/* Consistent border */}
            <InformationCircleIcon className="h-20 w-20 text-gray-400 dark:text-gray-600 mb-6" />
            <p className="text-2xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              No courses found yet.
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Check back later for new and exciting courses!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courselist;