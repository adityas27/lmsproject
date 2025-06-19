import { useEffect, useState } from 'react';
import axios from 'axios';

const PendingCertificates = () => {
  const [requests, setRequests] = useState([]);

  const fetchPending = async () => {
    const res = await axios.get('http://127.0.0.1:8000/api/courses/certificates/pending/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    });
    setRequests(res.data);
  };

  const handleAction = async (id, action) => {
    await axios.post(`http://127.0.0.1:8000/api/courses/certificates/${action}/${id}/`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    });
    fetchPending(); // refresh list
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {requests.map(req => (
        <div
          key={req.id}
          className="relative w-full max-w-md p-4 border rounded shadow bg-white"
        >
          {/* Status Badge */}
          <div className={`absolute top-2 right-2 px-3 py-1 text-sm rounded border ${getStatusStyle(req.status)}`}>
            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
          </div>

          {/* Card Content */}
          <p><strong>Student:</strong> {req.student_name} ({req.student_email})</p>
          <p><strong>Course:</strong> {req.course_title}</p>
          <p><strong>Progress:</strong> {req.progress}%</p>
          <p><strong>Applied:</strong> {new Date(req.applied_at).toLocaleString()}</p>

          {req.status === 'pending'&& (
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => handleAction(req.id, 'approve')}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(req.id, 'reject')}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PendingCertificates;
