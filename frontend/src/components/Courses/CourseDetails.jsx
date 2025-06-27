import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ModulesList from './Modules';
import ProgressBar from '../ProgressBar';
// Import necessary Heroicons
import {
  ArrowLeftIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  UserPlusIcon,
  PlusIcon,
  TrophyIcon,
  ListBulletIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon,
  CurrencyRupeeIcon,
  BookOpenIcon,
  IdentificationIcon,
  InformationCircleIcon // For error messages
} from '@heroicons/react/24/outline';


const CourseDetailPage = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [progress, setProgress] = useState(null);

  const renderStars = (rating) => {
    const fullStars = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return fullStars + emptyStars;
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      // URL untouched: Fetch course details
      const response = await axios.get(`http://127.0.0.1:8000/api/courses/courses/${slug}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setCourse(response.data);
      console.log(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description,
        price: response.data.price,
      });

      // Only fetch progress if student is enrolled
      if (response.data.is_enrolled) {
        // URL untouched: Fetch progress
        const progressRes = await axios.get(`http://127.0.0.1:8000/api/courses/courses/${slug}/progress/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });
        setProgress(progressRes.data);
        console.log(progressRes.data);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleEnroll = async () => {
    try {
      // URL untouched: Enroll course
      await axios.post(`http://127.0.0.1:8000/api/courses/courses/${slug}/enroll/`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      });
      alert("Enrolled successfully!");
      fetchCourse(); // Refresh course state to show "Already Enrolled" or progress bar
    } catch (err) {
      console.error(err);
      alert("Already enrolled or error occurred.");
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      // URL untouched: Patch course
      await axios.patch(`http://127.0.0.1:8000/api/courses/courses/${slug}/`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      });
      alert("Course updated successfully!");
      setEditMode(false);
      fetchCourse(); // Refresh course data
    } catch (err) {
      console.error(err);
      alert("Failed to update course.");
    }
  };

  const handleApplyForCertificate = async () => {
    try {
      // URL untouched: Apply for certificate
      await axios.post(
        `http://127.0.0.1:8000/api/courses/certificates/apply/${course.slug}/`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
      );
      alert("Certificate request sent!");
      fetchCourse(); // Refresh course state to potentially update certificate status
    } catch (error) {
      console.error(error);
      alert("Already applied or error occurred.");
    }
  };


  useEffect(() => {
    fetchCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading course details...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-950 text-red-600 dark:text-red-400">
        <div className="flex items-center space-x-3 text-lg font-medium">
          <InformationCircleIcon className="h-6 w-6" />
          <span>Course not found.</span>
        </div>
      </div>
    );
  }

  return (
    // Redesigned outer background for a cleaner, modern feel
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans antialiased">
      <div className="max-w-4xl mx-auto dark:bg-gray-850 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100 dark:border-gray-800">

        {/* Back to Courses Button - New Color (Indigo) */}
        <Link to="/courses" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition duration-200">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Courses
        </Link>

        {/* Progress Bar (if enrolled) */}
        {course.is_enrolled && progress && (
          <div className="my-6">
            <ProgressBar data={progress} />
          </div>
        )}

        {/* Author Actions: Edit Course Button & Form - New Color (Indigo) */}
        {course.is_author && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setEditMode(!editMode)}
              className="inline-flex items-center px-5 py-2 rounded-xl text-white font-semibold transition duration-300 transform hover:scale-105 shadow-md
                         bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 space-x-2"
            >
              {editMode ? (
                <>
                  <XMarkIcon className="h-5 w-5" />
                  <span>Cancel Edit</span>
                </>
              ) : (
                <>
                  <PencilIcon className="h-5 w-5" />
                  <span>Edit Course</span>
                </>
              )}
            </button>
          </div>
        )}

        {editMode && (
          <form onSubmit={handleUpdateCourse} className="mt-4 space-y-5 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700">
            <div>
              <label htmlFor="name" className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Title:</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Description:</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-h-[100px]"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Price:</label>
              <input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold transition duration-300 transform hover:scale-105 shadow-lg
                         bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 space-x-2"
            >
              <CheckIcon className="h-5 w-5" />
              <span>Save Changes</span>
            </button>
          </form>
        )}

        {/* Course Details Section */}
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">{course.name}</h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">{course.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center space-x-2">
              <BookOpenIcon className="h-6 w-6 text-indigo-600" />
              <span>Course Details</span>
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2 flex items-center"><IdentificationIcon className="h-5 w-5 mr-2 text-gray-500" /> <strong>Instructor:</strong> {`${course.author.first_name} ${course.author.last_name}` || "N/A"}</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2 flex items-center"><CurrencyRupeeIcon className="h-5 w-5 mr-2 text-gray-500" /> <strong>Price:</strong> Rs.{course.price}/-</p>
            <p className='text-yellow-500 dark:text-yellow-400 text-xl font-bold mt-3'>
              <strong>Rating:</strong>{renderStars(course.rating)} ({course.rating}/5)
            </p>
          </div>

          {/* Enroll/Enrolled Status Button - New Color (Rose) */}
          <div className="flex items-end justify-start md:justify-end">
            {!course.is_enrolled ? (
              <button
                onClick={handleEnroll}
                className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold transition duration-300 transform hover:scale-105 shadow-lg
                           bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 space-x-2"
              >
                <UserPlusIcon className="h-5 w-5" />
                <span>Enroll Now</span>
              </button>
            ) : (
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg inline-flex items-center space-x-2">
                <CheckIcon className="h-6 w-6" />
                <span>You are Enrolled!</span>
              </p>
            )}
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-5 border-b-2 border-indigo-500 pb-2">Course Modules</h2>
        <ModulesList modules={course.modules} isAuthor={course.is_author} />

        {/* Author Actions: Add Module Button - New Color (Violet) */}
        {course.is_author && (
          <div className="mt-8 flex justify-end">
            <Link to={`/courses/${course.slug}/add-module`}> {/* URL untouched */}
              <button className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold transition duration-300 transform hover:scale-105 shadow-md
                                 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Add New Module</span>
              </button>
            </Link>
          </div>
        )}

        {/* Certificate Actions Group - New Background & Accent (Fuchsia) */}
        {course.is_enrolled && (
          <div className="my-8 p-6 bg-fuchsia-50 dark:bg-fuchsia-900 rounded-xl shadow-inner border border-fuchsia-200 dark:border-fuchsia-700">
            <h3 className="text-xl font-bold text-fuchsia-800 dark:text-fuchsia-200 mb-4 flex items-center space-x-2">
              <TrophyIcon className="h-6 w-6 text-fuchsia-600" />
              <span>Certificate Status & Actions</span>
            </h3>

            <p className="font-medium text-gray-800 dark:text-gray-200 mb-4">
              Current Status: <span className="capitalize font-semibold text-fuchsia-700 dark:text-fuchsia-300">{course.certificate?.status || 'Not Applied'}</span>
            </p>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {progress?.progress === 100 && course.certificate?.status !== 'approved' && course.certificate?.status !== 'pending' && (
                <button
                  onClick={handleApplyForCertificate}
                  className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold transition duration-300 transform hover:scale-105 shadow-md
                             bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 space-x-2"
                >
                  <TrophyIcon className="h-5 w-5" />
                  <span>Apply for Certificate</span>
                </button>
              )}

              {course.certificate?.status === 'approved' && course.certificate.pdf_file && (
                <a
                  href={course.certificate.pdf_file} // URL untouched
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-xl text-blue-700 dark:text-blue-300 font-semibold transition duration-300 transform hover:scale-105 shadow-md border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 space-x-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>View Certificate PDF</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Author Actions: View Certificate Requests (Admin Group) - New Background & Accent (Amber) */}
        {course.is_author && (
          <div className="my-6 p-6 bg-amber-50 dark:bg-amber-900 rounded-xl shadow-inner border border-amber-200 dark:border-amber-700">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-4 flex items-center space-x-2">
              <ListBulletIcon className="h-6 w-6 text-amber-600" />
              <span>Admin Actions</span>
            </h3>
            <Link to={`/pending/certificates/applications/`}> {/* URL untouched */}
              <button className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold transition duration-300 transform hover:scale-105 shadow-md
                                 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 space-x-2">
                <ListBulletIcon className="h-5 w-5" />
                <span>View Certificate Requests</span>
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default CourseDetailPage;