import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditProfileForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/accounts/me/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setFormData({
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          email: res.data.email,
          bio: res.data.bio,
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = e => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    data.append('email', formData.email);
    data.append('bio', formData.bio);
    if (profileImage) data.append('profile_image', profileImage);
  
    try {
      await axios.patch('http://127.0.0.1:8000/api/accounts/me/update/', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setSuccess(true);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Edit Profile</h2>
      {success && <p className="text-green-600 text-sm mb-4 text-center">Profile updated successfully!</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <input
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
        <label className="block text-sm font-medium mb-1">Profile Image</label>
          <input
            type="file"
            name="profile_image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default EditProfileForm;
