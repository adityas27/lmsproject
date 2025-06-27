import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpenIcon, // For Study Material section heading
  ClipboardDocumentCheckIcon, // For Graded Work section heading
  DocumentTextIcon, // For 'text' content type
  PlayCircleIcon,   // For 'video' content type
  DocumentIcon,     // For 'file' content type
  CheckCircleIcon,  // For completed status
  CalendarDaysIcon, // For assignment deadline
  ArrowDownTrayIcon, // For download PDF
  InformationCircleIcon, // For empty states and errors
  ArrowLeftIcon,    // For back button
  AcademicCapIcon, // Fallback icon for content types
} from '@heroicons/react/24/outline'; // Make sure to import all required icons

const ModuleDetailPage = () => {
  const { slug } = useParams(); // slug of module
  const [moduleTitle, setModuleTitle] = useState("Module Contents"); // State to store module title
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [gradedAssignments, setGradedAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors

        // Fetch module details first to get the title
        const moduleRes = await axios.get(`http://127.0.0.1:8000/api/courses/modules/${slug}/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
        });
        setModuleTitle(moduleRes.data.title || "Module Contents");


        const res = await axios.get(`http://127.0.0.1:8000/api/courses/contents/?module_slug=${slug}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`
          }
        });

        // Assuming API returns 'content_type' for study materials and not for assignments
        const study = res.data.filter(item => item.content_type);
        const graded = res.data.filter(item => !item.content_type);

        setStudyMaterials(study);
        setGradedAssignments(graded);
      } catch (err) {
        console.error('Error fetching module contents:', err);
        setError('Failed to load module content. Please check your connection or try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading module content...
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


  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans antialiased">
      <div className="max-w-4xl mx-auto space-y-8 dark:bg-gray-850 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">

        {/* Back Button - Assuming you want to go back to the course detail page */}
        {/* You'll need to pass course_slug from the ModulesList or CourseDetailPage if you want to link back dynamically */}
        <Link to={`/courses`} className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition duration-200">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Courses
        </Link>
        {/* If you want to go back to a specific course, you'd need the course slug here */}
        {/* <Link to={`/courses/${courseSlug}`} ... >Back to Course</Link> */}


        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 border-b-2 border-indigo-500 pb-2">
          {moduleTitle}
        </h1>

        <section className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-3 border-b-2 border-fuchsia-500 pb-2">
            <BookOpenIcon className="h-8 w-8 text-fuchsia-600" />
            <span>Study Material</span>
          </h2>
          {studyMaterials.length === 0 ? (
            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
              <InformationCircleIcon className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
              <p className="text-lg font-medium">No study material available for this module yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studyMaterials.map((item) => (
                <Link to={`/module-contents/${item.id}`} key={item.id} className="block group">
                  <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition duration-300 ease-in-out transform group-hover:scale-[1.01] group-hover:shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {item.content_type === 'text' && <DocumentTextIcon className="h-6 w-6 mr-3 text-emerald-500" />}
                        {item.content_type === 'video' && <PlayCircleIcon className="h-6 w-6 mr-3 text-red-500" />}
                        {item.content_type === 'file' && <DocumentIcon className="h-6 w-6 mr-3 text-blue-500" />}
                        {!['text', 'video', 'file'].includes(item.content_type) && <AcademicCapIcon className="h-6 w-6 mr-3 text-gray-500" />} {/* Fallback icon */}
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </p>
                      </div>
                      {item.is_completed && (
                        <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                          <CheckCircleIcon className="h-5 w-5 mr-1" /> Completed
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      <span className="capitalize">{item.content_type}</span> - Duration: {item.duration} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-3 border-b-2 border-orange-500 pb-2">
            <ClipboardDocumentCheckIcon className="h-8 w-8 text-orange-600" />
            <span>Graded Work</span>
          </h2>
          {gradedAssignments.length === 0 ? (
            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
              <InformationCircleIcon className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
              <p className="text-lg font-medium">No assignments available for this module yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gradedAssignments.map((item) => (
                <Link to={`/module/${slug}/assignment/${item.id}`} key={item.id} className="block group">
                  <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition duration-300 ease-in-out transform group-hover:scale-[1.01] group-hover:shadow-xl">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                      {item.description}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex items-center">
                      <CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <strong>Deadline:</strong> {new Date(item.deadline).toLocaleString()}
                    </p>
                    {item.question_pdf && (
                      <a
                        href={item.question_pdf} // URL untouched
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-lg text-blue-700 dark:text-blue-300 font-semibold transition duration-300 hover:bg-blue-50 dark:hover:bg-blue-900 border border-blue-500 space-x-2"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        <span>Download Question PDF</span>
                      </a>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 italic">
                      Submission and grading details are handled on the assignment page.
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ModuleDetailPage;