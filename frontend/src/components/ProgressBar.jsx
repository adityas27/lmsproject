import React from 'react';

const ProgressBar = ({ data }) => {
  if (!data || !data.is_enrolled) return null;

  const progress = data.progress || 0;

  // Determine the gradient class based on progress
  let progressGradientClass = '';
  if (progress > 80) {
    // Over 80%: Vibrant green gradient
    progressGradientClass = 'from-emerald-500 to-emerald-600';
  } else if (progress >= 30) {
    // Between 30% and 80%: Red to yellow gradient
    progressGradientClass = 'from-red-500 to-yellow-500';
  } else {
    // Less than 30%: Dull red gradient
    progressGradientClass = 'from-red-600 to-red-300';
  }

  // Determine the text color for contrast if needed, but white should work for gradients
  const progressTextColor = 'text-white';

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
        <span className="mr-2">📈</span> Your Progress
      </h3>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-sm">
        <div
          className={`h-full text-sm font-bold flex items-center justify-center
                      bg-gradient-to-r ${progressGradientClass} ${progressTextColor} rounded-full
                      transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        >
          {progress > 5 && ( // Only show percentage if there's enough space
            <span>{Math.round(progress)}%</span>
          )}
        </div>
      </div>
      {/* Optional: Add a message based on progress */}
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        {progress === 100 ? (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">🎉 Congratulations! You've completed the course.</span>
        ) : progress > 80 ? (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Almost there! Keep up the great work.</span>
        ) : progress >= 30 ? (
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">Good progress! Keep learning.</span>
        ) : (
            <span className="font-semibold text-red-600 dark:text-red-400">You're just getting started! Dive into the first modules.</span>
        )}
      </p>
    </div>
  );
};

export default ProgressBar;