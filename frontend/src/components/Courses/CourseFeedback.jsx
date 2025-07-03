import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CourseFeedback = ({ courseSlug }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem('access');

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/courses/${courseSlug}/feedback/list/`);
      setFeedbacks(res.data);

      const existing = res.data.find(fb => fb.user === localStorage.getItem('username'));
      if (existing) {
        setUserRating(existing.rating);
        setUserComment(existing.comment);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRatingChange = (rating) => {
    setUserRating(rating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Login required");

    setIsSubmitting(true);
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/courses/${courseSlug}/feedback/`,
        { rating: userRating, comment: userComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [courseSlug]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded mt-8">
      <h2 className="text-lg font-bold mb-2">📝 Rate this Course</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`cursor-pointer text-2xl ${userRating >= star ? 'text-yellow-400' : 'text-gray-500'}`}
              onClick={() => handleRatingChange(star)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Leave a comment (optional)"
          className="w-full p-2 bg-gray-700 rounded"
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
          rows={3}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>

      <hr className="my-6 border-gray-700" />

      <h3 className="text-md font-semibold mb-2">📣 What others say</h3>
      {feedbacks.length === 0 ? (
        <p className="text-gray-400">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-gray-800 p-3 rounded shadow">
              <div className="flex justify-between">
                <p className="font-medium">{fb.user}</p>
                <p className="text-yellow-400">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</p>
              </div>
              {fb.comment && <p className="text-sm mt-1 text-gray-300">{fb.comment}</p>}
              <p className="text-xs text-gray-500 mt-1">{new Date(fb.submitted_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseFeedback;
