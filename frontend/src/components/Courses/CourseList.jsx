import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CourseListPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/courses/courses/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setCourses(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Courses</h1>
      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Link
              to={`/courses/${course.slug}`}
              key={course.slug}
              className="p-4 bg-white rounded-2xl shadow hover:shadow-md transition border"
            >
              <h2 className="text-xl font-semibold">{course.name}</h2>
              <p className="text-gray-600 mt-1">
                {course.description?.slice(0, 100)}...
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseListPage;
