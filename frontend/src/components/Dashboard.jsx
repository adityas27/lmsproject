import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LightBulbIcon, AcademicCapIcon, TrophyIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline'; // Importing heroicons for a modern look

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  
  // *** RESTORED ORIGINAL BASE_URL AND URL USAGE ***
  const BASE_URL = 'http://127.0.0.1:8000'; // Original BASE_URL with colon

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      // Adjusting for IST (India Standard Time) if needed, but Date() uses client's local time by default.
      // For precise server time, you'd need server-sent time or a more complex solution.
      // For client-side greeting, local time is usually preferred.
      if (hour >= 5 && hour < 12) return 'Good morning'; // 5 AM to 11:59 AM
      if (hour >= 12 && hour < 18) return 'Good afternoon'; // 12 PM to 5:59 PM
      return 'Good evening'; // 6 PM to 4:59 AM
    };
    setGreeting(getGreeting());
  }, []);

  const fetchDashboardData = async () => {
    try {
      const accessToken = localStorage.getItem('access');
      if (!accessToken) {
        console.error('Access token not found. Redirecting to login or handling session.');
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${accessToken}` };

      const [profileRes, coursesRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/accounts/me/', { headers }),
        axios.get('http://127.0.0.1:8000/api/courses/dashboard/', { headers }),
        // axios.get('/api/user/certificates/', { headers }), // Original, uncommented it.
      ]);


      setProfile(profileRes.data || {});
      setCourses(coursesRes.data.enrolled_courses || []);
      // setCertificates(certificatesRes.data || []); 

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response && err.response.status === 401) {
        console.log('Token expired or invalid. Redirecting to login.');
        // navigate('/login'); // Uncomment if you have navigate from react-router-dom
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <svg className="animate-spin h-6 w-6 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading your BrainBoard...
        </div>
      </div>
    );
  }

  // Filter once and reuse
  const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100);
  const notStartedCourses = courses.filter(c => c.progress === 0);
  const completedCourses = courses.filter(c => c.progress === 100);
  
  // *** RESTORED ORIGINAL BASE_URL USAGE FOR AVATAR ***
  const avatar = profile?.profile_image ? `${BASE_URL}${profile.profile_image}` : '/default-avatar.png';

  // Dynamic gradient for greeting text
  const getGreetingGradient = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'from-yellow-400 to-amber-500'; // Morning: warm, inviting
    if (hour >= 12 && hour < 18) return 'from-blue-400 to-indigo-500'; // Afternoon: calm, professional
    return 'from-purple-400 to-pink-500'; // Evening: soft, engaging
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Greeting */}
        <div className="py-8 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl">
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${getGreetingGradient()}`}>
            {greeting}, {profile?.first_name || profile?.username || 'Learner'}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Welcome back to your BrainBoard. Let's make today a productive day for learning.
          </p>
        </div>

        {/* Top Row: Profile and Certificates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Block */}
          <div className="bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl rounded-2xl p-6 flex flex-col items-center justify-between">
            <div className="text-center">
              <img
                src={avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-cyan-500 dark:border-cyan-400 shadow-md"
              />
              <h2 className="text-2xl font-semibold mt-4 text-gray-900 dark:text-white">
                {profile?.first_name} {profile?.last_name || profile?.username}
              </h2>
              {profile?.email && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">{profile.email}</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6 w-full">
              <Link
                to="/profile"
                className="flex-1 text-center bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 px-4 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md text-base"
              >
                View Profile
              </Link>
              <Link
                to="/edit_profile"
                className="flex-1 text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2.5 px-4 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md text-base"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Certificates Block (spans 2 cols on larger screens) */}
          <div className="bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl rounded-2xl p-6 md:col-span-2 flex flex-col">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
              <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" /> Your Achievements
            </h3>
            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow overflow-y-auto max-h-64 sm:max-h-96"> {/* Added max-h for scroll if many certificates */}
                {certificates.map(cert => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:shadow-lg transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-lg">{cert.course_title}</h4>
                      {cert.date_issued && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Issued: {new Date(cert.date_issued).toLocaleDateString()}</p>
                      )}
                    </div>
                    <a
                      href={cert.pdf_url}
                      className="mt-3 text-cyan-600 dark:text-cyan-400 hover:underline flex items-center text-sm font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BookOpenIcon className="h-4 w-4 mr-1" /> View Certificate
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-xl flex-grow">
                <AcademicCapIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  No certificates earned yet. Keep learning to achieve your first one!
                </p>
                <Link
                  to="/courses"
                  className="mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 px-6 rounded-xl transition duration-300 ease-in-out shadow-md"
                >
                  Explore Courses
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Courses Block - Full Width */}
        <div className="bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
            <BookOpenIcon className="h-6 w-6 mr-2 text-cyan-500" /> Your Enrolled Courses
          </h2>

          {/* In Progress */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-yellow-500" /> In Progress
            </h3>
            {inProgressCourses.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgressCourses.map(course => (
                  <li key={course.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-lg">{course.name}</h4>
                      {/* ORIGINAL URL for resume: `a href={`/courses/${course.slug}`}` */}
                      <Link to={`/courses/${course.slug}`} className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium text-sm">
                        Resume
                      </Link>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <div
                        className="bg-cyan-500 h-2.5 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{course.progress}% completed</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                You don't have any courses in progress right now. Time to start something new!
              </p>
            )}
          </div>

          <hr className="my-8 border-gray-200 dark:border-gray-700" />

          {/* Not Started */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
              <LightBulbIcon className="h-5 w-5 mr-2 text-orange-500" /> Ready to Start
            </h3>
            {notStartedCourses.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notStartedCourses.map(course => (
                  <li key={course.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900 dark:text-white text-lg">{course.name}</h4>
                      {/* ORIGINAL URL for start: `a href={`/courses/${course.slug}`}` */}
                      <Link to={`/courses/${course.slug}`} className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium text-sm">
                        Start Learning
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                You're all caught up! Explore new courses to continue your learning journey.
              </p>
            )}
          </div>

          <hr className="my-8 border-gray-200 dark:border-gray-700" />

          {/* Completed */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-green-500" /> Completed Courses
            </h3>
            {completedCourses.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedCourses.map(course => (
                  <li key={course.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900 dark:text-white text-lg">{course.name}</h4>
                      {/* ORIGINAL URL for revisit: `a href={`/courses/${course.slug}`}` */}
                      <Link to={`/courses/${course.slug}`} className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium text-sm">
                        Revisit
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                You haven't completed any courses yet. Finish one to see it here!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;