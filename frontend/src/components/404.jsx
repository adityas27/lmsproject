import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExclamationTriangleIcon, // A clear warning/error icon
  HomeIcon,                // For the home button
  ArrowLeftIcon,           // For the go back button
  MagnifyingGlassIcon      // For search
} from '@heroicons/react/24/outline'; // Make sure to install: npm install @heroicons/react

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 font-sans antialiased">
      <div className="max-w-xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-slate-700 p-10 text-center space-y-8">

        {/* Icon and Main Message */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <ExclamationTriangleIcon className="h-28 w-28 text-indigo-500 dark:text-indigo-400 animate-bounce-slow" /> {/* Larger, animated icon */}
          <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Page Not Found</h2>
        </div>

        {/* User Guidance */}
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Oops! It looks like you've ventured off the path. The page you're looking for might have been moved, deleted, or never existed.
        </p>

        {/* Helpful Links/Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            to="/"
            className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700
                       dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 ease-in-out transform hover:-translate-y-1 w-full sm:w-auto"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Go to Homepage
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-slate-600 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50
                       dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600 transition-colors duration-200 ease-in-out transform hover:-translate-y-1 w-full sm:w-auto"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Optional: Search Bar (as a navigation link) */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
          <p className="text-md text-gray-600 dark:text-gray-300 mb-4">
            Still lost? Try searching for what you need:
          </p>
          <Link
            to="/search" // Assuming you have a /search route for your CourseSearchFilter
            className="relative flex items-center bg-gray-100 dark:bg-slate-700 rounded-full shadow-inner border border-gray-300 dark:border-slate-600 overflow-hidden px-4 py-3
                       cursor-pointer hover:shadow-md transition-shadow duration-200 ease-in-out transform hover:scale-[1.01] w-full"
          >
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mr-3" />
            <span className="flex-grow text-gray-500 dark:text-gray-400 text-lg">Search our courses...</span>
            {/* Visually hidden input for accessibility if desired, but span is fine for a link */}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;