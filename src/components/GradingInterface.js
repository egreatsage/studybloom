'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaDownload } from 'react-icons/fa';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import { handleError, handleSuccess } from '@/lib/utils/errorHandler';

const GradingInterface = ({ assignmentId, onClose }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { submissions, loading, error, fetchSubmissions, gradeSubmission } = useAssignmentStore();

  // Fetch submissions when component mounts
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        await fetchSubmissions(assignmentId);
      } catch (error) {
        handleError(error, 'Failed to load submissions');
      }
    };
    loadSubmissions();
  }, [assignmentId, fetchSubmissions]);

  const handleGradeSubmit = async (submissionId) => {
    if (!grade || isNaN(parseFloat(grade))) {
      handleError(new Error('Please enter a valid grade'));
      return;
    }

    setSubmitting(true);
    try {
      await gradeSubmission(submissionId, {
        grade: parseFloat(grade),
        feedback,
      });
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      handleSuccess('Grade submitted successfully');
    } catch (error) {
      handleError(error, 'Failed to submit grade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg p-6">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
          <p className="mt-2 text-center">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-red-600 mb-4">Error loading submissions: {error}</div>
          <button
            onClick={() => fetchSubmissions(assignmentId)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Grade Submissions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {!submissions?.length ? (
          <p className="text-gray-500 text-center py-4">No submissions yet.</p>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {submission.student.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    {submission.files.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <FaDownload className="h-4 w-4" />
                        <span>File {index + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {submission.comment && (
                  <p className="text-gray-600 text-sm">{submission.comment}</p>
                )}

                {submission.grade ? (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="font-medium">Grade: {submission.grade}</div>
                    {submission.feedback && (
                      <div className="text-sm text-gray-600 mt-1">
                        Feedback: {submission.feedback}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Grade submission
                  </button>
                )}

                {selectedSubmission?._id === submission._id && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Grade (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="mt-1 block w-32 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Feedback
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                        placeholder="Provide feedback on the submission..."
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubmission(null);
                          setGrade('');
                          setFeedback('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleGradeSubmit(submission._id)}
                        disabled={submitting || !grade}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
                      >
                        {submitting ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Submit Grade</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradingInterface;
