import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const ModuleDetailPage = () => {
  const { slug } = useParams();  // slug of module
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [gradedAssignments, setGradedAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/courses/contents/?module_slug=${slug}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`
          }
        });

        const study = res.data.filter(item => item.content_type); // ModuleContent
        const graded = res.data.filter(item => !item.content_type); // Assignment

        setStudyMaterials(study);
        setGradedAssignments(graded);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [slug]);

  if (loading) return <p className="p-6">Loading module content...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Module Contents</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">📚 Study Material</h2>
        {studyMaterials.length === 0 ? <p>No study material available.</p> : (
          studyMaterials.map((item) => (
            <Link to={`/module-contents/${item.id}`} key={item.id} className="block">
            <div key={item.id} className="p-4 border mb-3 rounded bg-white shadow-sm">
              <p><strong>{item.title}</strong></p>
              <p><strong>Type:</strong> {item.content_type === 'text' && <span>Article</span>}
              {item.content_type === 'video' && <span>Video Lecture</span>}
              {item.content_type === 'file' && <span>Document</span>}
              </p>
              {item.is_completed && <span className="text-green-600 text-sm ml-2">✓ Completed</span>}
            </div>
            </Link>
          ))
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">📝 Graded Work</h2>
        {gradedAssignments.length === 0 ? <p>No assignments yet.</p> : (
          gradedAssignments.map((item) => (
            <Link to={`/module/${slug}/assignment/${item.id}`} key={item.id} className="block">
            <div key={item.id} className="p-4 border mb-3 rounded bg-gray-50 shadow-sm">
              <p><strong>Title:</strong> {item.title}</p>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Deadline:</strong> {new Date(item.deadline).toLocaleString()}</p>
              {item.question_pdf && <a className="text-blue-600 underline" href={item.question_pdf}>Download PDF</a>}
              <p className="text-sm text-gray-600 mt-2">Submissions / Grading handled separately.</p>
            </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
};

export default ModuleDetailPage;
