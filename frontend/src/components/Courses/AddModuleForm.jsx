import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AddModuleForm = () => {
  const { slug } = useParams(); // course slug
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    is_published: true,
  });
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/courses/modules/`,
        { ...formData, course: slug },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        }
      );
      alert('Module added!');
      navigate(`/courses/${slug}`);
    } catch (error) {
      console.error('Error adding module:', error);
      alert('Failed to add module');
    }
  };
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/courses/courses/${slug}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });
        if (!response.data.is_author) {
          setUnauthorized(true);
        } else {
          setCourse(response.data);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setUnauthorized(true); // Fail-safe: treat fetch error as unauthorized
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  if (loading) return <p className="p-4">Loading...</p>;

  if (unauthorized) {
    return (
      <div className='p-6 max-w-xl mx-auto'>
        <h2 className='text-2xl font-bold mb-4'>Unauthorized</h2>
        <p className='text-red-600'>You do not have permission to add modules to this course.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Module</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Title</label>
          <input name="title" value={formData.title} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block font-semibold">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block font-semibold">Order</label>
          <input type="number" name="order" value={formData.order} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} className="mr-2" />
          <label>Publish Module</label>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Module
        </button>
      </form>
    </div>
  );
};

export default AddModuleForm;
