import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link for back button
import axios from 'axios';
import { CheckCircleIcon } from '@heroicons/react/24/solid'; // Already solid for completed status

// Import outline icons for other elements
import {
  ArrowLeftIcon,
  AcademicCapIcon, // General content icon, or for title type
  ClockIcon,       // For duration
  ListBulletIcon,  // For order
  QuestionMarkCircleIcon, // For required status
  DocumentTextIcon, // For text content type label
  PlayCircleIcon,   // For video content type label
  DocumentIcon,     // For file content type label
  ArrowDownTrayIcon, // For download button
  InformationCircleIcon, // For errors/empty states
} from '@heroicons/react/24/outline';


// Robust YouTube ID extraction function
function extractYouTubeID(url) {
  if (!url) return null;
  // Regex to match various YouTube URL formats: watch, embed, youtu.be
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

const ModuleContentDetail = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState('');
  const [moduleSlug, setModuleSlug] = useState(null); // To link back to ModuleDetailPage

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(''); // Clear previous errors
        const res = await axios.get(`http://127.0.0.1:8000/api/courses/contents/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });
        setContent(res.data);
        setModuleSlug(res.data.module); // Assuming the API returns the module slug/ID here
        console.log("Module content data:", res.data);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content. Please check your network or try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const handleMarkComplete = async () => {
    setMarking(true);
    setError('');
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/courses/content-progress/complete/`,
        {
          content_id: content.id,
          course_id: content.course_id // Ensure course_id is correctly passed from API response
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        }
      );
      setContent(prev => ({ ...prev, is_completed: true }));
      // Optional: Trigger a notification or success message here
    } catch (err) {
      console.error('Error marking content as complete:', err);
      setError('Failed to mark content as complete. Please try again.');
    } finally {
      setMarking(false);
    }
  };

  const videoID = content?.video_url ? extractYouTubeID(content.video_url) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading content...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <div className="flex items-center space-x-3 text-lg font-medium">
          <InformationCircleIcon className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <div className="flex flex-col items-center space-y-3 text-lg font-medium">
          <InformationCircleIcon className="h-10 w-10 text-gray-500 dark:text-gray-600" />
          <span>Content not found.</span>
          <Link to={`/courses`} className="text-indigo-600 hover:underline">Back to Courses</Link>
        </div>
      </div>
    );
  }

  // Helper to get Content Type Icon
  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'text': return <DocumentTextIcon className="h-7 w-7 text-emerald-500" />;
      case 'video': return <PlayCircleIcon className="h-7 w-7 text-red-500" />;
      case 'file': return <DocumentIcon className="h-7 w-7 text-blue-500" />;
      default: return <AcademicCapIcon className="h-7 w-7 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans antialiased">
      <div className="max-w-5xl mx-auto dark:bg-gray-850 rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100 dark:border-gray-800 space-y-8">

        {/* Back Button */}
        {moduleSlug && (
          <Link
            to={`/module/${moduleSlug}`} // Assuming /modules/:slug links to ModuleDetailPage
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium mb-6 transition duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Module
          </Link>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-indigo-500 pb-4 mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            {getContentTypeIcon(content.content_type)}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white ml-3 mr-4">
              {content.title || `${content.content_type.toUpperCase()} Content`}
            </h1>
          </div>
          {content.is_completed && (
            <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-lg bg-emerald-50 dark:bg-emerald-950 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-700">
              <CheckCircleIcon className="h-7 w-7 mr-2" />
              Completed
            </div>
          )}
        </div>

        {/* Content Details (Duration, Order, Required) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm md:text-base">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <ClockIcon className="h-5 w-5 mr-2 text-indigo-500" />
            <p><strong>Duration:</strong> {content.duration} mins</p>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <ListBulletIcon className="h-5 w-5 mr-2 text-fuchsia-500" />
            <p><strong>Order:</strong> {content.order}</p>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-orange-500" />
            <p><strong>Required:</strong> {content.is_required ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Content Type Specific Rendering */}
        {content.content_type === 'text' && (
          <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
            {/* If content.text is plain text, render it directly. If it contains HTML/Markdown, use dangerouslySetInnerHTML or a markdown parser. */}
            <p>{content.text}</p>
          </div>
        )}

        {content.content_type === 'video' && videoID && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoID}`}
                title={content.title || "YouTube video player"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
            {content.text && (
              <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Description:</h3>
                <p>{content.text}</p>
              </div>
            )}
          </div>
        )}

        {content.content_type === 'file' && content.file && (
          <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between shadow-sm">
            <h4 className="font-semibold text-lg mb-3 sm:mb-0 text-gray-900 dark:text-white">
              Download Resource File
            </h4>
            <a
              href={content.file}
              className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md text-base
                         bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 space-x-2"
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Click to Download</span>
            </a>
          </div>
        )}
        
        {/* Mark as Complete Button */}
        {!content.is_completed && (
          <button
            onClick={handleMarkComplete}
            disabled={marking}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-xl text-white font-semibold text-lg
                       bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800
                       transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-lg
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 space-x-2"
          >
            {marking ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Marking...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-6 w-6" />
                <span>Mark as Complete</span>
              </>
            )}
          </button>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-700">
            <InformationCircleIcon className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleContentDetail;