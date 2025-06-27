import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpenIcon, // Main assignment icon
  CalendarDaysIcon, // Deadline icon
  ArrowDownTrayIcon, // Download PDF icon
  CloudArrowUpIcon, // Submit file icon
  ChatBubbleBottomCenterTextIcon, // Comment/Feedback icon
  AcademicCapIcon, // Grade icon
  ClipboardDocumentCheckIcon, // Graded work / submissions section
  UserIcon, // Student name icon
  CheckCircleIcon, // Graded / Success status (solid)
  ClockIcon, // Loading spinner alternative/detail
  ArrowLeftIcon, // Back button
  InformationCircleIcon, // Error/empty state
  PaperClipIcon, // For file inputs
  PencilSquareIcon, // For feedback input
  CubeTransparentIcon // Fallback for loading
} from '@heroicons/react/24/outline'; // Using outline for most, solid for CheckCircleIcon if preferred


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

  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [gradingStatus, setGradingStatus] = useState({}); // To track grading state per submission

  const token = localStorage.getItem('access');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAssignmentAndSubmissions = async () => {
      setLoadingAssignment(true);
      setSubmissionError('');
      try {
        // Fetch assignment details
        const assignmentRes = await axios.get(`http://127.0.0.1:8000/api/courses/modules/${moduleId}/assignments/`, { headers });
        const foundAssignment = assignmentRes.data.find(a => a.id === parseInt(assignmentId));
        setAssignment(foundAssignment);
        setIsAuthor(foundAssignment?.is_author);

        // Fetch submissions based on user role
        if (foundAssignment?.is_author) {
          await fetchSubmissions(assignmentId);
        } else {
          await fetchMySubmission(assignmentId);
        }
      } catch (err) {
        console.error('Error fetching assignment details:', err);
        setSubmissionError('Failed to load assignment details.');
      } finally {
        setLoadingAssignment(false);
      }
    };

    fetchAssignmentAndSubmissions();
  }, [moduleId, assignmentId]);

  const fetchSubmissions = async (id) => {
    setLoadingSubmissions(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/courses/assignments/${id}/submissions/`, { headers });
      setSubmissions(res.data);
      setGraded(res.data.filter(s => s.grade !== null));
      setUngraded(res.data.filter(s => s.grade === null));
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setSubmissionError('Failed to load submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const fetchMySubmission = async (id) => {
    setLoadingSubmissions(true); // Reusing for student's submission load
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/courses/assignments/${id}/submissions/`, { headers });
      const mine = res.data.find(s => s.is_owner);
      setMySubmission(mine || null);
    } catch (err) {
      console.error('Error fetching my submission:', err);
      setSubmissionError('Failed to load your submission status.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const submitAssignment = async (e) => {
    e.preventDefault();
    setSubmittingAssignment(true);
    setSubmissionError('');

    if (!selectedFile) {
      setSubmissionError('Please select a file to submit.');
      setSubmittingAssignment(false);
      return;
    }

    const form = new FormData();
    form.append('submitted_files', selectedFile);
    form.append('comment', comment);
    console.log('Submitting assignment with form data:', form, selectedFile);
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/courses/assignments/${assignmentId}/submit/`,
        form,
        { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }
      );
      alert('Assignment submitted successfully!'); // Replace with toast later
      setSelectedFile(null);
      setComment('');
      fetchMySubmission(assignmentId);
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmissionError('Submission failed. Please try again.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleGrade = async (subId, newGrade, newFeedback, newCorrectedFile) => {
    setGradingStatus(prev => ({ ...prev, [subId]: { status: 'grading', error: '' } }));
    const form = new FormData();
    form.append('grade', newGrade);
    form.append('feedback', newFeedback);
    if (newCorrectedFile instanceof File) {
      form.append('corrected_file', newCorrectedFile);
    }

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/courses/submissions/${subId}/grade/`,
        form,
        { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }
      );
      setGradingStatus(prev => ({ ...prev, [subId]: { status: 'success', error: '' } }));
      alert('Submission graded successfully!'); // Replace with toast later
      fetchSubmissions(assignmentId); // Re-fetch all submissions to update lists
    } catch (err) {
      console.error('Grading failed:', err);
      setGradingStatus(prev => ({ ...prev, [subId]: { status: 'error', error: 'Grading failed.' } }));
      alert('Grading failed. Please ensure grade and feedback are valid.');
    }
  };

  if (loadingAssignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading assignment details...
        </div>
      </div>
    );
  }

  if (submissionError && !assignment) { // Only show full error page if assignment itself failed to load
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <div className="flex items-center space-x-3 text-lg font-medium">
          <InformationCircleIcon className="h-6 w-6" />
          <span>{submissionError}</span>
        </div>
      </div>
    );
  }

  if (!assignment) { // Fallback if no assignment found (e.g., wrong ID)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <div className="flex flex-col items-center space-y-3 text-lg font-medium">
          <InformationCircleIcon className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
          <span>Assignment not found.</span>
          <Link to={`/modules/${moduleId}`} className="text-indigo-600 hover:underline">Back to Module</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans antialiased">
      <div className="max-w-7xl mx-auto dark:bg-gray-850 rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100 dark:border-gray-800 space-y-8">

        {/* Back Button */}
        <Link
          to={`/modules/${moduleId}`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium mb-6 transition duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Module
        </Link>

        {/* Page Header */}
        <div className="flex items-center space-x-4 border-b-2 border-indigo-500 pb-4 mb-6">
          <BookOpenIcon className="h-10 w-10 text-indigo-600" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            {assignment.title}
          </h1>
        </div>

        {submissionError && (
          <div className="flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-700">
            <InformationCircleIcon className="h-6 w-6 mr-2" />
            <span>{submissionError}</span>
          </div>
        )}

        {/* Assignment Details Card - Now full width */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <BookOpenIcon className="h-7 w-7 text-indigo-500" />
            <span>Assignment Overview</span>
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
            {assignment.description}
          </p>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-fuchsia-500" />
            <span>Deadline: {new Date(assignment.deadline).toLocaleString()}</span>
          </div>
          {assignment.question_pdf && (
            <a
              href={assignment.question_pdf}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-lg text-blue-700 dark:text-blue-300 font-semibold transition duration-300 hover:bg-blue-50 dark:hover:bg-blue-900 border border-blue-500 space-x-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Download Question PDF</span>
            </a>
          )}
        </div>

        {/* Conditional Sections (Student vs. Instructor) - All full width */}
        {isAuthor ? (
          // Instructor View - Full Width Sections
          <>
            {/* Ungraded Submissions */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 border-b pb-3 mb-4 border-yellow-500/50">
                <ClipboardDocumentCheckIcon className="h-7 w-7 text-yellow-500" />
                <span>Ungraded Submissions ({ungraded.length})</span>
              </h2>
              {loadingSubmissions ? (
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <CubeTransparentIcon className="animate-spin h-8 w-8 mr-2 text-yellow-500" />
                  Loading submissions...
                </div>
              ) : ungraded.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                  <InformationCircleIcon className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                  <p>No pending submissions for this assignment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ungraded.map((sub) => (
                    <div key={sub.id} className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
                      <p className="font-semibold text-lg flex items-center"><UserIcon className="h-5 w-5 mr-2 text-purple-500" /> {sub.student_name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1 text-gray-500" />
                        Comment: {sub.comment || 'N/A'}
                      </p>
                      <a href={sub.submitted_file} target="_blank" rel="noreferrer"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm space-x-1">
                        <ArrowDownTrayIcon className="h-4 w-4" /> <span>View Submitted File</span>
                      </a>
                      <div className="space-y-2 mt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feedback:</label>
                        <textarea
                          placeholder="Provide feedback..."
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                          defaultValue={sub.feedback || ''}
                          onChange={e => {
                            const newUngraded = ungraded.map(item => item.id === sub.id ? { ...item, feedback: e.target.value } : item);
                            setUngraded(newUngraded);
                          }}
                        />
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grade (0-100):</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Grade"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                          defaultValue={sub.grade || ''}
                          onChange={e => {
                            const newUngraded = ungraded.map(item => item.id === sub.id ? { ...item, grade: e.target.value } : item);
                            setUngraded(newUngraded);
                          }}
                        />
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Corrected File (Optional):</label>
                        <input
                          type="file"
                          className="w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800"
                          onChange={e => {
                            const newUngraded = ungraded.map(item => item.id === sub.id ? { ...item, corrected_file: e.target.files[0] } : item);
                            setUngraded(newUngraded);
                          }}
                        />
                        <button
                          className={`mt-4 w-full inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold text-white transition duration-300 ${gradingStatus[sub.id]?.status === 'grading' ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                          onClick={() => handleGrade(sub.id, sub.grade, sub.feedback, sub.corrected_file)}
                          disabled={gradingStatus[sub.id]?.status === 'grading'}
                        >
                          {gradingStatus[sub.id]?.status === 'grading' ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Grading...
                            </>
                          ) : (
                            'Submit Grade'
                          )}
                        </button>
                        {gradingStatus[sub.id]?.error && (
                          <p className="text-red-500 text-sm mt-2">{gradingStatus[sub.id].error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Graded Submissions */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 border-b pb-3 mb-4 border-emerald-500/50">
                <CheckCircleIcon className="h-7 w-7 text-emerald-500" />
                <span>Graded Submissions ({graded.length})</span>
              </h2>
              {loadingSubmissions ? (
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <CubeTransparentIcon className="animate-spin h-8 w-8 mr-2 text-emerald-500" />
                  Loading submissions...
                </div>
              ) : graded.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                  <InformationCircleIcon className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                  <p>No submissions have been graded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {graded.map((sub) => (
                    <div key={sub.id} className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
                      <p className="font-semibold text-lg flex items-center"><UserIcon className="h-5 w-5 mr-2 text-purple-500" /> {sub.student_name}</p>
                      <p className="text-gray-700 dark:text-gray-300 flex items-center text-lg font-bold"><AcademicCapIcon className="h-6 w-6 mr-2 text-orange-500" /> Grade: {sub.grade} / 100</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1 text-gray-500" />
                        Feedback: {sub.feedback || 'No feedback provided.'}
                      </p>
                      <a href={sub.submitted_file} target="_blank" rel="noreferrer"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm space-x-1 mr-4">
                        <ArrowDownTrayIcon className="h-4 w-4" /> <span>View Submitted File</span>
                      </a>
                      {sub.corrected_file && (
                        <a href={sub.corrected_file} target="_blank" rel="noreferrer"
                          className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline text-sm space-x-1">
                          <ArrowDownTrayIcon className="h-4 w-4" /> <span>Download Corrected File</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // Student View - Full Width Sections
          <>
            {/* Student View - My Submission Status */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 border-b pb-3 mb-4 border-indigo-500/50">
                <ClipboardDocumentCheckIcon className="h-7 w-7 text-indigo-500" />
                <span>Your Submission</span>
              </h2>
              {loadingSubmissions ? (
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <CubeTransparentIcon className="animate-spin h-8 w-8 mr-2 text-indigo-500" />
                  Loading your submission...
                </div>
              ) : mySubmission ? (
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Submitted on: {new Date(mySubmission.submission_date).toLocaleString()}</p>
                  <a href={mySubmission.submitted_file} className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline space-x-1" target="_blank" rel="noreferrer">
                    <ArrowDownTrayIcon className="h-4 w-4" /> <span>Your Submitted File</span>
                  </a>
                  <p className="text-gray-700 dark:text-gray-300 flex items-center text-sm">
                    <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1 text-gray-500" />
                    Comment: {mySubmission.comment || 'No comment provided.'}
                  </p>
                  {mySubmission.grade !== null && (
                    <>
                      <p className="text-emerald-600 dark:text-emerald-400 flex items-center text-lg font-bold"><AcademicCapIcon className="h-6 w-6 mr-2 text-emerald-500" /> Grade: {mySubmission.grade} / 100</p>
                      <p className="text-gray-700 dark:text-gray-300 flex items-center text-sm">
                        <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1 text-gray-500" />
                        Feedback: {mySubmission.feedback || 'No feedback provided.'}
                      </p>
                      {mySubmission.corrected_file && (
                        <a href={mySubmission.corrected_file} className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline space-x-1" target="_blank" rel="noreferrer">
                          <ArrowDownTrayIcon className="h-4 w-4" /> <span>Download Corrected File</span>
                        </a>
                      )}
                    </>
                  )}
                  {mySubmission.grade === null && (
                    <p className="text-yellow-600 dark:text-yellow-400 flex items-center text-sm font-medium">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Awaiting Grading
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                  <InformationCircleIcon className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                  <p>You have not submitted this assignment yet.</p>
                </div>
              )}
            </div>

            {/* Student Submission Form (only if not submitted) - Full Width */}
            {!mySubmission && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <CloudArrowUpIcon className="h-7 w-7 text-green-500" />
                  <span>Submit Your Work</span>
                </h2>
                <form onSubmit={submitAssignment} className="space-y-4">
                  <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select File:
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={e => {
                        console.log('Selected file:', e.target.files);
                        setSelectedFile(e.target.files[0])}}
                      className="w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800"
                    />
                    {selectedFile && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <PaperClipIcon className="h-4 w-4 mr-1" /> {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comment (Optional):
                    </label>
                    <textarea
                      id="comment"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add a comment for your submission..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingAssignment || !selectedFile}
                    className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold text-lg
                               bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
                               transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-lg
                               disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 space-x-2"
                  >
                    {submittingAssignment ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="h-6 w-6" />
                        <span>Submit Assignment</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

      </div> {/* End of max-w-7xl mx-auto container */}
    </div>
  );
};

export default AssignmentDetailPage;