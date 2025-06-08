// src/components/AddModuleContent.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddModuleContent = () => {
  const { courseSlug, moduleSlug } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    content_type: 'text',
    text: '',
    video_url: '',
    file: null,
    order: 0,
    is_required: false,
    duration: 0,
  });
  const [course, setCourse] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (type === 'file') {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== '') formData.append(key, value);
    });
    formData.append('module', moduleSlug);

    try {
      await axios.post('http://127.0.0.1:8000/api/courses/contents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      alert('Content added!');
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('Failed to add content.');
    }
  };
useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/courses/courses/${courseSlug}/`, {
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
  }, [moduleSlug]);

  if (loading) return <p className="p-4">Loading...</p>;

  if (unauthorized) {
    return (
      <div className='p-6 max-w-xl mx-auto'>
        <h2 className='text-2xl font-bold mb-4'>Unauthorized</h2>
        <p className='text-red-600'>You do not have permission to add content to this module.</p>
      </div>
    )
  }
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Module Content</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="content_type"
          value={form.content_type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="text">Text</option>
          <option value="video">Video</option>
          <option value="file">File</option>
        </select>

        {form.content_type === 'text' && (
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            placeholder="Text content"
            className="w-full p-2 border rounded"
          />
        )}

        {form.content_type === 'video' && (
          <input
            type="url"
            name="video_url"
            value={form.video_url}
            onChange={handleChange}
            placeholder="YouTube or video URL"
            className="w-full p-2 border rounded"
          />
        )}

        {form.content_type === 'file' && (
          <input
            type="file"
            name="file"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        )}

        <input
          type="number"
          name="order"
          value={form.order}
          onChange={handleChange}
          placeholder="Order"
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="duration"
          value={form.duration}
          onChange={handleChange}
          placeholder="Duration in minutes"
          className="w-full p-2 border rounded"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_required"
            checked={form.is_required}
            onChange={handleChange}
          />
          <span>Required</span>
        </label>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Content
        </button>
      </form>
    </div>
  );
};

export default AddModuleContent;
