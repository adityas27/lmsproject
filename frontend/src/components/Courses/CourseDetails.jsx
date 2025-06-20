import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ModulesList from './Modules';
import ProgressBar from '../ProgressBar';
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
      </Link> <br />
      <div className="p-6 max-w-4xl mx-auto">
        {course.is_enrolled && (
          <ProgressBar data={progress} />
        )}
      </div>


      {course.is_author && (
        <button
          onClick={() => setEditMode(!editMode)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {editMode ? 'Cancel Edit' : 'Edit Course'}
        </button>
      )}


      {editMode && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await axios.patch(`http://127.0.0.1:8000/api/courses/courses/${slug}/`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
              });
              alert("Course updated");
              setEditMode(false);
              fetchCourse();
            } catch (err) {
              console.error(err);
              alert("Failed to update course");
            }
          }}
          className="mt-4 space-y-4 bg-gray-100 p-4 rounded"
        >
          <div>
            <label className="block font-medium">Title:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Price:</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save Changes
          </button>
        </form>
      )}

      <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
      <p className="text-gray-700 mb-4">{course.description}</p>
      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">More Info</h3>
        <p><strong>Instructor:</strong> {`${course.author.first_name} ${course.author.last_name}` || "N/A"}</p>
        <p><strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}</p>
        <p><strong>Price:</strong> Rs.{course.price}/-</p>
        <p className='text-yellow-500 text-lg'><strong>Rating:</strong>{renderStars(course.rating)} ({course.rating}/5) </p>
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
      <ModulesList modules={course.modules} isAuthor={course.is_author} />

      {course.is_author && (
        <div className="my-4">
          <Link to={`/courses/${course.slug}/add-module`}>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              + Add Module
            </button>
          </Link>
        </div>
      )}
      {/* Certificate Actions */}
      {course.is_enrolled && (
        <div className="my-6">
          {progress?.progress === 100 && (
            <button onClick={async () => {
                try {
                  console.log(`${localStorage.getItem('access')}`)
                  await axios.post(
                    `http://127.0.0.1:8000/api/courses/certificates/apply/${course.slug}/`,
                    {},
                    { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
                  );
                  alert("Certificate request sent!");
                  fetchCourse(); // Optional: refresh course state
                } catch (error) {
                  console.error(error);
                  alert("Already applied or error occurred.");
                }
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Apply for Certificate
            </button>
          )}
        </div>
      )}

      {course.is_author && (
        <div className="my-4">
          <Link to={`/pending/certificates/applications/`}>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
              View Certificate Requests
            </button>
          </Link>
        </div>
      )}
      {course.is_enrolled && course.certificate && (
        <div className="mt-4 p-4 bg-gray-100 rounded border">
          <p className="font-medium text-gray-800">
            Certificate Status: <span className="capitalize">{course.certificate.status}</span>
          </p>

          {course.certificate.status === 'approved' && course.certificate.pdf_file && (
            <a
              href={course.certificate.pdf_file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline mt-2 inline-block"
            >
              🎓 View Certificate PDF
            </a>
          )}
        </div>
      )}

    </div>
  );
};

export default CourseDetailPage;
