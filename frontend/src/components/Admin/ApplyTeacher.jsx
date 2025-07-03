import React, { useState } from 'react';
import axios from 'axios';
import {
  AcademicCapIcon, // For education
  LightBulbIcon,   // For skills
  CubeTransparentIcon, // For expertise
  BriefcaseIcon,   // For experience
  PaperAirplaneIcon, // For submit button/success icon
  ExclamationCircleIcon // For errors
} from '@heroicons/react/24/outline'; // Make sure you have @heroicons/react installed

const BASE_URL = 'http://127.0.0.1:8000'; // Define your base URL

const BecomeTeacherForm = () => {
  const [formData, setFormData] = useState({
    highest_education: '',
    skills: '',
    expertise: '',
    past_experience: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access'); // assumes JWT token is stored in localStorage

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading true on submission
    setError(null); // Clear previous errors

    try {
      // Basic validation: Check if all fields are filled
      const isFormValid = Object.values(formData).every(field => field.trim() !== '');
      if (!isFormValid) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      await axios.post(`${BASE_URL}/api/admin/teacher-application/submit/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // Explicitly set content-type
        },
      });
      setSubmitted(true);
      // Optionally clear form after successful submission
      setFormData({
        highest_education: '',
        skills: '',
        expertise: '',
        past_experience: '',
      });
    } catch (err) {
      console.error('Application submission error:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please log in to submit your application.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail); // Use backend error message if available
      } else {
        setError('Application failed. You might have already applied or there was a server error. Please try again.');
      }
    } finally {
      setLoading(false); // Set loading false after submission attempt
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900 font-sans antialiased">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 text-center">
          <PaperAirplaneIcon className="h-20 w-20 text-green-500 mx-auto mb-6 transform -rotate-45" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Application Submitted!</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your teacher application has been successfully submitted and is now under review. We'll get back to you soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900 font-sans antialiased">
      <form onSubmit={handleSubmit} className="max-w-2xl w-full bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center flex items-center justify-center space-x-3">
          <AcademicCapIcon className="h-9 w-9 text-indigo-600 dark:text-indigo-400" />
          <span>Become a Teacher</span>
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2 animate-fade-in">
            <ExclamationCircleIcon className="h-6 w-6 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Highest Education */}
        <div>
          <label htmlFor="highest_education" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-500" />
            Highest Education
          </label>
          <input
            type="text"
            id="highest_education"
            name="highest_education"
            value={formData.highest_education}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="e.g., Master of Science in Computer Science"
          />
        </div>

        {/* Skills */}
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
            Skills (comma-separated or paragraph)
          </label>
          <textarea
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            rows={4}
            placeholder="e.g., Python, JavaScript, Data Analysis, Web Development, Public Speaking"
          />
        </div>

        {/* Areas of Expertise */}
        <div>
          <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <CubeTransparentIcon className="h-5 w-5 mr-2 text-purple-500" />
            Areas of Expertise
          </label>
          <textarea
            id="expertise"
            name="expertise"
            value={formData.expertise}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            rows={4}
            placeholder="e.g., Artificial Intelligence, Frontend Frameworks, Digital Marketing Strategies"
          />
        </div>

        {/* Past Teaching/Work Experience */}
        <div>
          <label htmlFor="past_experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <BriefcaseIcon className="h-5 w-5 mr-2 text-green-500" />
            Past Teaching/Work Experience
          </label>
          <textarea
            id="past_experience"
            name="past_experience"
            value={formData.past_experience}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            rows={4}
            placeholder="Describe your relevant teaching roles, industry experience, or mentorship activities."
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-md
                     transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <PaperAirplaneIcon className="h-5 w-5 transform rotate-45" />
              <span>Submit Application</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BecomeTeacherForm;