import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/accounts/me/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });
        setUserData(res.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchProfile();
  }, []);

  if (!userData) {
    return (
      <div className="text-center mt-20 text-gray-600 text-xl">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">User Dashboard</h2>
      
      <div className="flex flex-col items-center mb-6">
        <img
          src={`http://127.0.0.1:8000${userData.profile_image}`}
          alt="Profile"
          className="w-32 h-32 object-cover rounded-full border-4 border-blue-500 mb-4"
        />
        <p className="text-xl font-semibold">{userData.first_name} {userData.last_name}</p>
        <p className="text-gray-500">{userData.username}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
        <div>
          <p className="font-semibold">Email:</p>
          <p>{userData.email}</p>
        </div>
        <div>
          <p className="font-semibold">Is Teacher:</p>
          <p>{userData.is_teacher ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <p className="font-semibold">Bio:</p>
          <p>{userData.bio || '—'}</p>
        </div>
        <div>
          <p className="font-semibold">Date of Birth:</p>
          <p>{userData.date_of_birth || 'Not Provided'}</p>
        </div>
        <div>
          <p className="font-semibold">User ID:</p>
          <p>{userData.id}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
