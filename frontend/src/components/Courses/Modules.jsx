import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ModuleList = ({ modules }) => {
  const [expandedModuleSlug, setExpandedModuleSlug] = useState(null);

  const toggleModule = (slug) => {
    setExpandedModuleSlug(expandedModuleSlug === slug ? null : slug);
  };

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div key={module.slug} className="border rounded-lg p-4 shadow">
          <div
            className="cursor-pointer font-semibold text-lg flex justify-between items-center"
            onClick={() => toggleModule(module.slug)}
          >
            <span>{module.title}</span>
            <span>{expandedModuleSlug === module.slug ? '▲' : '▼'}</span>
          </div>

          {expandedModuleSlug === module.slug && (
            <div className="mt-3 ml-4">
              {module.contents.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {module.contents.map((content) => (
                    <li key={content.id}>
                      <Link
                        to={`/module-contents/${content.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {content.content_type.toUpperCase()} - Duration: {content.duration} min
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No contents available.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModuleList;
