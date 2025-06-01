'use client';

import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { handleError, handleSuccess, formatDate } from '@/lib/utils/errorHandler';
import SubmissionForm from './SubmissionForm';
import GradingInterface from './GradingInterface';

const AssignmentDetails = ({ assignment, onClose, isTeacher }) => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showGradingInterface, setShowGradingInterface] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPastDue = new Date(assignment.dueDate) < new Date();

  const handleSubmission = async (formData) => {
    try {
      setLoading(true);
      // Handle submission logic here
      await onSubmit(formData);
      handleSuccess('Assignment submitted successfully');
      setShowSubmissionForm(false);
    } catch (error) {
      handleError(error, 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleGrading = async (submissionId, gradeData) => {
    try {
      setLoading(true);
      // Handle grading logic here
      await onGrade(submissionId, gradeData);
      handleSuccess('Grade submitted successfully');
    } catch (error) {
      handleError(error, 'Failed to submit grade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{assignment.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-gray-600 mt-1">{assignment.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Due Date</h3>
            <p className="text-gray-600 mt-1">
              {formatDate(assignment.dueDate)}
              {isPastDue && (
                <span className="text-red-500 ml-2">(Past Due)</span>
              )}
            </p>
          </div>

          {!isTeacher && (
            <div>
              <button
                onClick={() => setShowSubmissionForm(true)}
                disabled={loading || isPastDue}
                className={`px-4 py-2 rounded-md ${
                  isPastDue
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white flex items-center space-x-2 disabled:opacity-50`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Assignment</span>
                )}
              </button>
              {isPastDue && (
                <p className="text-red-500 text-sm mt-1">
                  Submissions are no longer accepted for this assignment
                </p>
              )}
            </div>
          )}

          {isTeacher && (
            <div>
              <button
                onClick={() => setShowGradingInterface(true)}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>View Submissions & Grade</span>
                )}
              </button>
            </div>
          )}
        </div>

        {showSubmissionForm && (
          <SubmissionForm
            assignmentId={assignment._id}
            onClose={() => setShowSubmissionForm(false)}
            onSubmit={handleSubmission}
          />
        )}

        {showGradingInterface && (
          <GradingInterface
            assignmentId={assignment._id}
            onClose={() => setShowGradingInterface(false)}
            onGrade={handleGrading}
          />
        )}
      </div>
    </div>
  );
};

export default AssignmentDetails;
