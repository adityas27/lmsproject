import { useState } from 'react';
import { Link } from 'react-router-dom';
// Importing Heroicons for consistency and better aesthetics
import {
  PencilSquareIcon, // For editing module
  PlusCircleIcon,   // For adding content
  ChevronDownIcon,  // For collapsed module
  ChevronUpIcon,    // For expanded module
  DocumentTextIcon, // For 'TEXT' content type
  DocumentIcon,     // For 'FILE' content type (or DocumentArrowDownIcon)
  PlayCircleIcon,   // For 'VIDEO' content type
  FolderIcon,       // For module icon
  InformationCircleIcon // For "No contents" message
} from '@heroicons/react/24/outline';

const ModulesList = ({ modules, isAuthor = false }) => {
  const [expandedModuleSlug, setExpandedModuleSlug] = useState(null);

  const toggleModule = (slug) => {
    setExpandedModuleSlug(expandedModuleSlug === slug ? null : slug);
  };

  return (
    <div className="space-y-4 font-sans antialiased text-gray-900 dark:text-white">
      {modules.length === 0 ? (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          <InformationCircleIcon className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
          <p className="text-lg font-medium">No modules available for this course yet.</p>
          {isAuthor && (
            <p className="mt-2 text-sm">
              As an author, you can add new modules from the "Add New Module" button below.
            </p>
          )}
        </div>
      ) : (
        modules.map((module) => (
          <div
            key={module.slug}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700 transition duration-300 ease-in-out hover:shadow-xl"
          >
            <div
              className="cursor-pointer font-semibold text-xl flex justify-between items-center text-gray-900 dark:text-white"
              onClick={() => toggleModule(module.slug)}
            >
              <div className="flex items-center space-x-3">
                <FolderIcon className="h-7 w-7 text-indigo-500" /> {/* Module icon */}
                <Link to={`/module/${module.slug}`} className="hover:underline">
                <span>{module.title}</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {isAuthor && (
                  <>
                    {/* Edit Module Button - Indigo */}
                    <Link
                      to={`/modules/${module.slug}/edit`} // URL untouched
                      title="Edit Module"
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition duration-200"
                    >
                      <PencilSquareIcon className="w-6 h-6" />
                    </Link>
                    {/* Add Content Button - Violet */}
                    <Link
                      to={`/courses/${module.course}/modules/${module.slug}/add-content`} // URL untouched
                      title="Add Content"
                      className="text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 transition duration-200"
                    >
                      <PlusCircleIcon className="w-6 h-6" />
                    </Link>
                  </>
                )}
                {/* Accordion Toggle Icon */}
                <span className="text-gray-500 dark:text-gray-400">
                  {expandedModuleSlug === module.slug ? (
                    <ChevronUpIcon className="w-6 h-6" />
                  ) : (
                    <ChevronDownIcon className="w-6 h-6" />
                  )}
                </span>
              </div>
            </div>

            {expandedModuleSlug === module.slug && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ml-2"> {/* Adjusted margin for nested content */}
                {module.contents.length > 0 ? (
                  <ul className="space-y-3"> 
                    {module.contents.map((content) => (
                      <li key={content.id} className="flex items-center text-gray-700 dark:text-gray-300 text-base">
                        {/* Content Type Icon */}
                        {content.content_type === 'text' && <DocumentTextIcon className="h-5 w-5 mr-3 text-emerald-500" />}
                        {content.content_type === 'file' && <DocumentIcon className="h-5 w-5 mr-3 text-blue-500" />}
                        {content.content_type === 'video' && <PlayCircleIcon className="h-5 w-5 mr-3 text-red-500" />}
                        {/* Fallback for unknown types */}
                        {!['text', 'file', 'video'].includes(content.content_type) && <AcademicCapIcon className="h-5 w-5 mr-3 text-gray-500" />}

                        {/* Content Link */}
                        <Link
                          to={`/module-contents/${content.id}`} // URL untouched
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition duration-200"
                        >
                          <span className="capitalize">{content.content_type}</span> - Duration: {content.duration} min
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">No contents available for this module.</p>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ModulesList;