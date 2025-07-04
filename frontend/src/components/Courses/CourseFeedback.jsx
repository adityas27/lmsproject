import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StarIcon,               // For interactive rating stars
  PaperAirplaneIcon,      // For submit button
  CheckCircleIcon,        // For success messages
  ExclamationCircleIcon,  // For error messages
  ChatBubbleBottomCenterTextIcon, // For "What others say" section
  UserCircleIcon,         // Default avatar icon
  AcademicCapIcon         // For overall course feedback section title
} from '@heroicons/react/24/outline'; // Make sure you have @heroicons/react installed

const BASE_URL = 'http://127.0.0.1:8000'; // Define your base URL

const CourseFeedback = ({ courseSlug }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(null); // For success/error messages
  const [hasUserReviewed, setHasUserReviewed] = useState(false); // To know if user has reviewed

  const token = localStorage.getItem('access');
  const currentUsername = localStorage.getItem('username'); // Assuming username is stored here

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/courses/${courseSlug}/feedback/list/`);
      const fetchedFeedbacks = res.data;
      setFeedbacks(fetchedFeedbacks);

      const existingReview = fetchedFeedbacks.find(fb => fb.user === currentUsername);
      if (existingReview) {
        setUserRating(existingReview.rating);
        setUserComment(existingReview.comment);
        setHasUserReviewed(true);
      } else {
        // Reset if no existing review, in case user navigates between pages
        setUserRating(0);
        setUserComment('');
        setHasUserReviewed(false);
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      // Optionally show an error message to the user
      setSubmissionMessage({ type: 'error', text: 'Failed to load feedbacks. Please try again.' });
    }
  };

  const handleRatingChange = (rating) => {
    setUserRating(rating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage(null); // Clear previous messages

    if (!token) {
      setSubmissionMessage({ type: 'error', text: 'You must be logged in to submit feedback.' });
      return;
    }
    if (userRating === 0) {
      setSubmissionMessage({ type: 'error', text: 'Please select a rating (1-5 stars).' });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${BASE_URL}/api/courses/${courseSlug}/feedback/`,
        { course: courseSlug, rating: userRating, comment: userComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissionMessage({ type: 'success', text: hasUserReviewed ? 'Your review has been updated successfully!' : 'Thank you for your feedback!' });
      fetchFeedbacks(); // Refresh the list
    } catch (err) {
      console.error("Feedback submission error:", err.response?.data || err.message);
      let errorMessage = "Failed to submit feedback. Please try again.";
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data; // Raw string error from backend
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail; // DRF common detail message
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0]; // Specific non-field errors
        } else {
          // Iterate over object errors
          errorMessage = Object.values(err.response.data).flat().join(' ');
        }
      }
      setSubmissionMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [courseSlug, token, currentUsername]); // Re-fetch if course, token, or username changes

  // Calculate average rating and total reviews
  const totalRatings = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
  const averageRating = feedbacks.length > 0 ? (totalRatings / feedbacks.length).toFixed(1) : 'N/A';
  const totalReviews = feedbacks.length;

  return (
    <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg border border-slate-700 mt-8 font-sans">
      <h2 className="text-2xl font-bold mb-5 text-center flex items-center justify-center space-x-2">
        <AcademicCapIcon className="h-7 w-7 text-indigo-400" />
        <span>Course Feedback & Reviews</span>
      </h2>

      {/* Average Rating Display */}
      <div className="flex items-center justify-center mb-6 py-3 bg-slate-700 rounded-lg shadow-inner">
        <span className="text-4xl font-extrabold text-yellow-400 mr-2">{averageRating}</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={`avg-${star}`}
              className={`h-7 w-7 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-500'}`}
              fill="currentColor"
              stroke="currentColor" // Ensures the whole star is filled
            />
          ))}
        </div>
        <span className="ml-3 text-gray-300">({totalReviews} reviews)</span>
      </div>


      <h3 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-3">
        {hasUserReviewed ? '🖊️ Your Review' : '📝 Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {submissionMessage && (
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            submissionMessage.type === 'success' ? 'bg-green-600/20 text-green-300 border border-green-500' : 'bg-red-600/20 text-red-300 border border-red-500'
          }`}>
            {submissionMessage.type === 'success' ? (
              <CheckCircleIcon className="h-6 w-6" />
            ) : (
              <ExclamationCircleIcon className="h-6 w-6" />
            )}
            <p className="text-sm">{submissionMessage.text}</p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <label className="text-gray-300 font-medium">Your Rating:</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`cursor-pointer h-8 w-8 transition-colors duration-200 ${
                  userRating >= star ? 'text-yellow-400' : 'text-gray-500/70 hover:text-gray-400'
                }`}
                onClick={() => handleRatingChange(star)}
                fill={userRating >= star ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>

        <textarea
          placeholder="Share your thoughts on this course..."
          className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
          rows={4}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-md
                     transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ring-offset-slate-800"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{hasUserReviewed ? 'Updating...' : 'Submitting...'}</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="h-5 w-5 transform -rotate-45" />
              <span>{hasUserReviewed ? 'Update My Review' : 'Submit My Review'}</span>
            </>
          )}
        </button>
      </form>

      <hr className="my-8 border-slate-700" />

      <h3 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-3 flex items-center space-x-2">
        <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-gray-400" />
        <span>What others say</span>
      </h3>
      {feedbacks.length === 0 ? (
        <p className="text-gray-400 text-center py-4">Be the first to leave a review!</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-slate-700 p-4 rounded-lg shadow-md border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {/* User Avatar - using Heroicon as placeholder */}
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div>
                    <p className="font-medium text-lg text-white">{fb.user}</p>
                    <p className="text-xs text-gray-400">{new Date(fb.submitted_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</p>
                  </div>
                </div>
                {/* Star Rating for display */}
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={`display-star-${fb.id}-${star}`}
                      className={`h-5 w-5 ${star <= fb.rating ? 'text-yellow-400' : 'text-gray-500'}`}
                      fill="currentColor"
                      stroke="currentColor"
                    />
                  ))}
                </div>
              </div>
              {fb.comment && <p className="text-sm mt-1 text-gray-200 leading-relaxed">{fb.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseFeedback;