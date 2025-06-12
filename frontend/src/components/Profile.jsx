import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // optional if you're using React Router

const BASE_URL = 'http://127.0.0.1:8000'; // Change as needed

const ProfileCard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access');
        const res = await axios.get(`${BASE_URL}/api/accounts/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading profile...</p>;
  if (!user) return <p className="p-6 text-center text-red-500">Failed to load profile.</p>;

  const avatar = user?.profile_image ? `${BASE_URL}${user.profile_image}` : '/default-avatar.png';
  const banner = user?.banner_image ? `${BASE_URL}${user.banner_image}` : null;

  return (
    <div className="mt-6 bg-white shadow rounded-lg overflow-hidden max-w-6xl mx-auto">
      {/* Banner */}
      {banner && (
        <div
          className="h-36 bg-cover bg-center"
          style={{ backgroundImage: `url(${banner})` }}
        ></div>
      )}

      {/* Avatar + Info */}
      <div className="p-6 flex flex-col items-center text-center">
        <img
          src={avatar}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-white -mt-16 bg-white object-cover"
        />
        <h2 className="text-xl font-semibold mt-2">
          {user?.first_name} {user?.last_name}
        </h2>
        <p className="text-gray-500 text-sm">@{user?.username}</p>

        <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
          {user?.bio || 'No bio provided.'}
        </p>

        <div className="mt-4 space-y-2 w-full text-sm text-left text-gray-600">
          {user?.email && <p><strong>Email:</strong> {user.email}</p>}
          {user?.phone_number && <p><strong>Phone:</strong> {user.phone_number}</p>}
          {user?.date_of_birth && (
            <p><strong>DOB:</strong> {new Date(user.date_of_birth).toLocaleDateString()}</p>
          )}
          <p><strong>Joined:</strong> {new Date(user.joined_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {user.is_verified ? '✅ Verified' : '❌ Not Verified'}</p>
          <p><strong>Role:</strong> {user.is_teacher ? 'Instructor' : 'Student'}</p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 w-full">
          <Link to="/edit_profile">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Edit Profile
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Go to Dashboard
            </button>
          </Link>
          <Link to={user.is_teacher ? "/teacher/analytics" : "/become-teacher"}>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              {user.is_teacher ? 'View Teacher Analytics' : 'Become a Teacher'}
            </button>
          </Link>
          {/* Create Course Button (Only for Teachers) */}
        {user.is_teacher && (
            <Link to="/courses/add-new">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Create New Course
              </button>
            </Link>
        )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
