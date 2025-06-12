import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = 'http://127:0.0.1:8000';
  const fetchDashboardData = async () => {
    try {
      const accessToken = localStorage.getItem('access');
      const headers = { Authorization: `Bearer ${accessToken}` };

      const [profileRes, coursesRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/accounts/me/', { headers }),
        axios.get('http://127.0.0.1:8000/api/courses/dashboard/', { headers }),
        // axios.get('/api/user/certificates/', { headers }),
      ]);
      console.log('Profile Data:', profileRes.data);
      setProfile(profileRes.data || {});
      setCourses(coursesRes.data.enrolled_courses || []);
      // setCertificates(certificatesRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  // Filter once and reuse
  const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100);
  const notStartedCourses = courses.filter(c => c.progress === 0);
  const completedCourses = courses.filter(c => c.progress === 100);
  const avatar = profile?.profile_image ? `${BASE_URL}${profile.profile_image}` : '/default-avatar.png';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Row: Profile and Certificates */}
      <div className="grid grid-cols md:grid-cols-3 gap-2">
        {/* Profile Block */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="text-center">
            <img
              src={avatar}
              alt="Profile"
              className="w-20 h-20 rounded-full mx-auto"
            />
            <h2 className="text-lg font-semibold mt-2">{profile?.first_name} {profile?.last_name}</h2>
            <p className="text-gray-600 text-sm">@{profile?.username}</p>
          </div>
          <br />
          <div className="flex justify-center items-center">
      <div className="space-x-4">
        <Link
          to="/profile"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded inline-block"
        >
          View Profile
        </Link>
        <Link
          to="/edit_profile"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded inline-block"
        >
          Edit Profile
        </Link>
      </div>
    </div>
        </div>

        {/* Certificates Block (spans 2 cols on larger screens) */}
        <div className="bg-white shadow-md rounded-lg p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Certificates</h3>
          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map(cert => (
                <div
                  key={cert.id}
                  className="border p-3 rounded hover:shadow-lg transition"
                >
                  <h4 className="font-medium">{cert.course_title}</h4>
                  <a
                    href={cert.pdf_url}
                    className="text-blue-600 text-sm underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Certificate
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No certificates yet.</p>
          )}
        </div>
      </div>

      {/* Courses Block - Full Width */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Enrolled Courses</h2>

        {/* In Progress */}
        <h3 className="text-md font-semibold mb-2 mt-4">In Progress Courses</h3>
        {inProgressCourses.length > 0 ? (
          <ul className="space-y-3">
            {inProgressCourses.map(course => (
              <li key={course.id} className="p-3 border rounded-lg bg-blue-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{course.name}</h4>
                    <p className="text-sm text-yellow-600">{course.progress}% completed</p>
                  </div>
                  <a href={`/courses/${course.slug}`} className="text-blue-600 hover:underline">
                    Resume
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">You don't have any in-progress courses.</p>
        )}

        <hr className="my-4" />

        {/* Not Started */}
        <h3 className="text-md font-semibold mb-2 mt-4">Didn't even start yet</h3>
        {notStartedCourses.length > 0 ? (
          <ul className="space-y-3">
            {notStartedCourses.map(course => (
              <li key={course.id} className="p-3 border rounded-lg bg-red-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{course.name}</h4>
                  </div>
                  <a href={`/courses/${course.slug}`} className="text-blue-600 hover:underline">
                    Start
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">You're all caught up!</p>
        )}

        <hr className="my-4" />

        {/* Completed */}
        <h3 className="text-md font-semibold mt-6 mb-2">Completed Courses</h3>
        {completedCourses.length > 0 ? (
          <ul className="space-y-3">
            {completedCourses.map(course => (
              <li key={course.id} className="p-3 border rounded-lg bg-green-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{course.name}</h4>
                  </div>
                  <a href={`/courses/${course.slug}`} className="text-blue-600 hover:underline">
                    Revisit
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">You haven't completed any courses yet.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
