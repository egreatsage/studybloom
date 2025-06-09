'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaDownload } from 'react-icons/fa';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import { handleError, handleSuccess } from '@/lib/utils/errorHandler';

// 1. Change props from { assignmentId, ... } to { assignment, ... }
const GradingInterface = ({ assignment, onClose }) => {
  // 2. Remove the store hook and useEffect, as we no longer need to fetch.
  const { gradeSubmission, fetchAssignment } = useAssignmentStore();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);



  const handleGradeSubmit = async (submissionId) => {
    if (!grade || isNaN(parseFloat(grade))) {
      handleError(new Error('Please enter a valid grade'));
      return;
    }
    setIsSubmittingGrade(true);
    try {
      // 3. Use the assignment._id from the prop for the gradeSubmission call.
      await gradeSubmission(assignment._id, submissionId, { grade: parseFloat(grade), feedback });
      // After grading, refetch the assignment to update the view.
      await fetchAssignment(assignment._id);
      setSelectedSubmissionId(null);
      setGrade('');
      setFeedback('');
      handleSuccess('Grade submitted successfully');
    } catch (error) {
      handleError(error, 'Failed to submit grade');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  // 4. Use the submissions directly from the assignment prop.
  const submissions = assignment?.submissions || [];

  // No need for a loading state here anymore.

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-start p-6 border-b">
          <h2 className="text-2xl font-bold">Grade Submissions for "{assignment?.title}"</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
            {!submissions.length ? (
              <p className="text-gray-500 text-center py-8">No submissions yet.</p>
            ) : (
              <div className="space-y-6">
                {submissions.map((submission) => (
                  <div key={submission._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{submission.student.name}</h3>
                        <p className="text-sm text-gray-500">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="space-x-2">
                        {submission.files.map((file, index) => (
                          <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                            <FaDownload className="h-4 w-4" />
                            <span>{file.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {submission.grade ? (
                      <div className="bg-green-50 p-3 rounded-md border border-green-200">
                        <div className="font-medium text-green-800">Graded: {submission.grade}/100</div>
                        {submission.feedback && <p className="text-sm text-green-700 mt-1">Feedback: {submission.feedback}</p>}
                      </div>
                    ) : (
                      <button onClick={() => setSelectedSubmissionId(submission._id)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Grade Submission</button>
                    )}

                    {selectedSubmissionId === submission._id && (
                      <div className="mt-4 space-y-4 pt-4 border-t">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Grade (0-100)</label>
                          <input type="number" min="0" max="100" step="0.1" value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 block w-32 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Feedback</label>
                          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder="Provide feedback..." className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button type="button" onClick={() => { setSelectedSubmissionId(null); setGrade(''); setFeedback(''); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                          <button onClick={() => handleGradeSubmit(submission._id)} disabled={isSubmittingGrade || !grade} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2">
                            {isSubmittingGrade ? (<><FaSpinner className="animate-spin" /><span>Saving...</span></>) : (<span>Submit Grade</span>)}
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
    </div>
  );
};

export default GradingInterface;