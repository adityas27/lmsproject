import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ModulesList from './Modules'; 
const CourseDetailPage = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const renderStars = (rating) => {
  const fullStars = '★'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return fullStars + emptyStars;
};
  const fetchCourse = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/courses/courses/${slug}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };


const handleEnroll = async () => {
  try {
    await axios.post(`http://127.0.0.1:8000/api/courses/courses/${slug}/enroll/`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    });
    alert("Enrolled successfully!");
  } catch (err) {
    console.error(err);
    alert("Already enrolled or error occurred.");
  }
};

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  if (loading) return <p className="p-6">Loading course...</p>;
  if (!course) return <p className="p-6 text-red-500">Course not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/courses" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Courses
      </Link>
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-700 mb-4">{course.description}</p>
      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">More Info</h3>
        <p><strong>Instructor:</strong> {`${course.author.first_name} ${course.author.last_name}` || "N/A"}</p>
        <p><strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}</p>
        <p><strong>Price:</strong> Rs.{course.price}/-</p>
        <p className='text-yellow-500 text-lg'><strong>Rating:</strong>{renderStars(course.rating)} ({course.rating}/5) </p>
        <p><strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}</p>
      </div>
      <br />
      {!course.is_enrolled ? (
        <button onClick={handleEnroll} className="bg-blue-500 border border-blue-600 text-white px-4 py-2 rounded hover:bg-blue-60">
          Enroll
        </button>
      ) : (
        <p className="text-green-600 font-semibold">Already Enrolled</p>
      )}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Modules</h2>
      <ModulesList modules={course.modules} />
    </div>
  );
};

export default CourseDetailPage;
