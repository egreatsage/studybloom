'use client';

import { useState } from 'react';
import { FaSpinner, FaLink } from 'react-icons/fa';
import { handleError, handleSuccess, formatDate } from '@/lib/utils/errorHandler';
import SubmissionForm from './SubmissionForm';
import GradingInterface from './GradingInterface';
import useAssignmentStore from '@/lib/stores/assignmentStore'; // Import the store

const AssignmentDetails = ({ assignment, onClose, isTeacher }) => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showGradingInterface, setShowGradingInterface] = useState(false);
  
  // Get the submitAssignment action and loading state from the store
  const { submitAssignment, loading } = useAssignmentStore();

  const isPastDue = new Date(assignment.dueDate) < new Date();

  // This is the real submission handler now
  const handleSubmission = async (formData) => {
    try {
      await submitAssignment(assignment._id, formData);
      setShowSubmissionForm(false); // Close form on success
    } catch (error) {
      // The store already shows a toast error, but you can add more logic here if needed.
      console.error("Submission failed in component:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{assignment.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* ... (rest of the component content remains the same) ... */}
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
          {/* ... */}
        </div>
        
        {showSubmissionForm && (
          <SubmissionForm
            assignmentId={assignment._id}
            onClose={() => setShowSubmissionForm(false)}
            onSubmit={handleSubmission} // Pass the real handler
          />
        )}

        {showGradingInterface && (
          <GradingInterface
            assignment={assignment}
            onClose={() => setShowGradingInterface(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AssignmentDetails;