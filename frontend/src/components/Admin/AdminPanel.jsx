import React, { useState } from 'react';
import UserList from './UsersList'; // Assuming this is the AdminUserList component we just improved
import TeacherApplication from './TeacherApplication'; // Assuming this component exists
import StudentList from './StudentsList'; // Assuming this component exists
import CourseList from './CourseList'; // Assuming this component exists
import {
  Cog6ToothIcon,         // Main admin panel icon
  UsersIcon,              // Icon for Users tab
  AcademicCapIcon,        // Icon for Teacher Applications tab
  UserGroupIcon,          // Icon for Students tab
  BookOpenIcon,           // Icon for Courses tab
} from '@heroicons/react/24/outline'; // Make sure to install: npm install @heroicons/react

// Define your tabs with names and components, and now, icons!
const tabs = [
  { name: 'Users', icon: <UsersIcon className="h-5 w-5 mr-2" />, component: <UserList /> },
  { name: 'Teacher Applications', icon: <AcademicCapIcon className="h-5 w-5 mr-2" />, component: <TeacherApplication /> },
  { name: 'Students', icon: <UserGroupIcon className="h-5 w-5 mr-2" />, component: <StudentList /> },
  { name: 'Courses', icon: <BookOpenIcon className="h-5 w-5 mr-2" />, component: <CourseList /> },
];

const AdminPanelTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-slate-900 font-sans antialiased">
      <div className="max-w-6xl mx-auto">
        {/* Admin Panel Header */}
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center flex items-center justify-center space-x-3">
          <Cog6ToothIcon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          <span>Admin Panel</span>
        </h1>

        {/* Tabs Navigation */}
        <div className="flex justify-evenly flex-wrap border-b-2 border-gray-200 dark:border-slate-700">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                flex items-center justify-center py-3 px-6 text-base font-semibold rounded-t-lg
                transition-all duration-300 ease-in-out whitespace-nowrap w-1/4 my-1
                ${index === activeTab
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400 -mb-0.5' // -mb-0.5 to overlap border
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 border-b-2 border-transparent'
                }
              `}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-b-2xl rounded-tr-2xl shadow-xl border border-gray-100 dark:border-slate-700 min-h-[500px] transition-all duration-300 ease-in-out">
          {tabs[activeTab].component}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelTabs;