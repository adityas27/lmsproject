import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AssignmentDetailPage = () => {
  const { moduleId, assignmentId } = useParams();
  const [isAuthor, setIsAuthor] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [graded, setGraded] = useState([]);
  const [ungraded, setUngraded] = useState([]);
  const [mySubmission, setMySubmission] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const token = localStorage.getItem('access');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/courses/modules/${moduleId}/assignments/`, { headers });
        const found = res.data.find(a => a.id === parseInt(assignmentId));
        setAssignment(found);
        setIsAuthor(found?.is_author);
        if (found?.is_author) {
          fetchSubmissions(assignmentId);
        } else {
          fetchMySubmission(assignmentId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssignment();
  }, [moduleId, assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/courses/assignments/${assignmentId}/submissions/`, { headers });
      setSubmissions(res.data);
      setGraded(res.data.filter(s => s.grade !== null));
      setUngraded(res.data.filter(s => s.grade === null));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMySubmission = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/courses/assignments/${assignmentId}/submissions/`, { headers });
      const mine = res.data.find(s => s.is_owner);
      setMySubmission(mine || null);
    } catch (err) {
      console.error(err);
    }
  };

  const submitAssignment = async () => {
    const form = new FormData();
    form.append('submitted_file', selectedFile);
    form.append('comment', comment);
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/courses/assignments/${assignmentId}/submit/`,
        form,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert('Assignment submitted!');
      fetchMySubmission();
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    }
  };

  const handleGrade = async (sub) => {
    const form = new FormData();
    form.append('grade', sub.grade);
    form.append('feedback', sub.feedback);
    if (sub.corrected_file instanceof File) {
      form.append('corrected_file', sub.corrected_file);
    }

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/courses/submissions/${sub.id}/grade/`,
        form,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      fetchSubmissions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-2">📘 Assignment Details</h2>

      {assignment ? (
        <div className="p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold">{assignment.title}</h3>
          <p>{assignment.description}</p>
          <p className="text-sm text-gray-500">Deadline: {new Date(assignment.deadline).toLocaleString()}</p>
          {assignment.question_pdf && (
            <a href={assignment.question_pdf} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download PDF</a>
          )}
        </div>
      ) : <p className="text-gray-600">Loading assignment...</p>}

      {/* Student submission form */}
      {!isAuthor && assignment && !mySubmission && (
        <div className="space-y-2">
          <h3 className="font-semibold">Submit your Work</h3>
          <input type="file" onChange={e => setSelectedFile(e.target.files[0])} />
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Comment"
            onChange={e => setComment(e.target.value)}
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={submitAssignment}>
            Submit
          </button>
        </div>
      )}

      {/* Student: already submitted */}
      {!isAuthor && mySubmission && (
        <div className="p-3 border rounded bg-green-50">
          <p><strong>Your File:</strong> <a href={mySubmission.submitted_file} className="text-blue-600 underline" target="_blank" rel="noreferrer">View</a></p>
          <p><strong>Comment:</strong> {mySubmission.comment}</p>
          {mySubmission.grade && <p><strong>Grade:</strong> {mySubmission.grade} / 10</p>}
          {mySubmission.feedback && <p><strong>Feedback:</strong> {mySubmission.feedback}</p>}
        </div>
      )}

      {/* Teacher grading section */}
      {isAuthor && (
        <>
          <h3 className="text-lg font-semibold mt-4">Ungraded Submissions</h3>
          {ungraded.length === 0 && <p className="text-gray-600">No pending submissions.</p>}
          {ungraded.map((sub) => (
            <div key={sub.id} className="border p-3 rounded bg-yellow-50 space-y-2">
              <p><strong>Student:</strong> {sub.student_name}</p>
              <a href={sub.submitted_file} target="_blank" rel="noreferrer" className="text-blue-600 underline">View File</a>
              <textarea placeholder="Feedback" className="border w-full p-2" onChange={e => sub.feedback = e.target.value} />
              <input type="number" placeholder="Grade" className="border w-full p-2" onChange={e => sub.grade = e.target.value} />
              <input type="file" className="w-full" onChange={e => sub.corrected_file = e.target.files[0]} />
              <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={() => handleGrade(sub)}>Submit Grade</button>
            </div>
          ))}

          <h3 className="text-lg font-semibold mt-6">Graded Submissions</h3>
          {graded.length === 0 && <p className="text-gray-600">No graded submissions yet.</p>}
          {graded.map(sub => (
            <div key={sub.id} className="border p-3 rounded bg-green-50 space-y-2">
              <p><strong>Student:</strong> {sub.student_name}</p>
              <a href={sub.submitted_file} target="_blank" className="text-blue-600 underline" rel="noreferrer">Submitted File</a>
              <p><strong>Feedback:</strong> {sub.feedback}</p>
              <p><strong>Grade:</strong> {sub.grade}</p>
              {sub.corrected_file && (
                <p><strong>Corrected File:</strong> <a href={sub.corrected_file} className="text-purple-600 underline" target="_blank" rel="noreferrer">Download</a></p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AssignmentDetailPage;
