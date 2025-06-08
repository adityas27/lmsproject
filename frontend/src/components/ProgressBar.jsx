import React from 'react';

const ProgressBar = (data) => {
  if (!data.data.is_enrolled) return null;

  const progress = data.data.progress || 0;
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Your Progress</h3>
      <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
        <div
          className="bg-green-700 h-5 text-xs font-medium text-white text-center leading-none"
          style={{ width: `${progress}%` }}
        >
          {progress}%
          {data.is_enrolled}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
