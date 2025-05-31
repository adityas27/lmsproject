import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ModuleContentDetail = () => {
  const { id } = useParams(); // content ID from route
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchContent = async () => {
      
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/courses/contents/${id}/`, 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access')}`,
            },
          }
        );
        setContent(res.data);
      } catch (error) {
        console.error('Error fetching module content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!content) return <div>Content not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">
        {content.content_type.toUpperCase()} Content (ID: {content.id})
      </h2>

      <p><strong>Duration:</strong> {content.duration} mins</p>
      <p><strong>Order:</strong> {content.order}</p>
      <p><strong>Required:</strong> {content.is_required ? 'Yes' : 'No'}</p>

      {content.content_type === 'text' && (
        <div className="mt-4">
          <h4 className="font-bold mb-2">Text</h4>
          <p>{content.text}</p>
        </div>
      )}

      {content.content_type === 'video' && (
        <div className="mt-4">
          <h4 className="font-bold mb-2">Video</h4>
          <iframe
            src={content.video_url}
            title="Video Content"
            className="w-full h-64"
            allowFullScreen
          />
        </div>
      )}

      {content.content_type === 'file' && content.file && (
        <div className="mt-4">
          <h4 className="font-bold mb-2">Download File</h4>
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
    </div>
  );
};

export default ModuleContentDetail;
