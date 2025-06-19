import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const ModuleContentDetail = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/courses/contents/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });
        setContent(res.data);
        console.log(res.data);
      } catch (err) {
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const handleMarkComplete = async () => {
    setMarking(true);
    setError('');
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/courses/content-progress/complete/`,
        { content_id: content.id,
          course_id: content.course_id  
         },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        }
      );
      setContent(prev => ({ ...prev, is_completed: true }));
    } catch (err) {
      setError('Error marking content as complete');
    } finally {
      setMarking(false);
    }
  };

  function extractYouTubeID(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if (hostname === 'youtu.be') {
      return parsedUrl.pathname.slice(1); // remove leading slash
    }

    if (hostname === 'www.youtube.com' || hostname === 'youtube.com') {
      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v');
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        return parsedUrl.pathname.split('/embed/')[1];
      }
    }

    return null; // Not a valid YouTube link
  } catch (err) {
    return null;
  }
}
  const videoID = content?.video_url ? extractYouTubeID(content.video_url) : null;

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!content) return <div className="p-6 text-red-500">Content not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{content.content_type.toUpperCase()} Content</h2>
        {content.is_completed && (
          <div className="flex items-center text-green-600 font-medium">
            <CheckCircleIcon className="h-6 w-6 mr-1" />
            Completed
          </div>
        )}
      </div>

      <div className="text-gray-700 space-y-2">
        <p><strong>Duration:</strong> {content.duration} mins</p>
        <p><strong>Order:</strong> {content.order}</p>
        <p><strong>Required:</strong> {content.is_required ? 'Yes' : 'No'}</p>
      </div>

      {content.content_type === 'text' && (
        <div className="bg-gray-100 p-4 rounded">
          <h4 className="font-semibold mb-2">Text Content</h4>
          <p>{content.text}</p>
        </div>
      )}

      {content.content_type === 'video' && (
        <div>
          <h4 className="font-semibold mb-2">Video</h4>
          <iframe width="720" height="450" src={`https://www.youtube.com/embed/${videoID}`} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          <br />
          <hr/>
          <br />
          <p>{content.text}</p>
        </div>
      )}

      {content.content_type === 'file' && content.file && (
        <div>
          <h4 className="font-semibold mb-2">Download File</h4>
          <a
            href={content.file}
            className="text-blue-600 underline"
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            Click to download
          </a>
        </div>
      )}

      {!content.is_completed && (
        <button
          onClick={handleMarkComplete}
          disabled={marking}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {marking ? 'Marking...' : 'Mark as Complete'}
        </button>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ModuleContentDetail;
