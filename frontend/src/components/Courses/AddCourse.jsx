import React, { useState } from 'react';
import axios from 'axios';

const AddCourseForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    launch_date: '',
    duration: '',
    level: 'beginner',
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear individual field error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg('');

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/courses/courses/', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setSuccessMsg('Course created successfully!');
      setFormData({
        name: '',
        description: '',
        price: '',
        launch_date: '',
        duration: '',
        level: 'beginner',
      });
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create a New Course</h2>

      {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}
      {errors.general && <p className="text-red-600 mb-4">{errors.general}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Course Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        <div>
          <label className="block font-medium">Price (₹)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>

        <div>
          <label className="block font-medium">Launch Date</label>
          <input
            type="date"
            name="launch_date"
            value={formData.launch_date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.launch_date && <p className="text-red-500 text-sm">{errors.launch_date}</p>}
        </div>

        <div>
          <label className="block font-medium">Duration (in hours)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
        </div>

        <div>
          <label className="block font-medium">Level</label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {errors.level && <p className="text-red-500 text-sm">{errors.level}</p>}
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Course
        </button>
      </form>
    </div>
  );
};

export default AddCourseForm;
