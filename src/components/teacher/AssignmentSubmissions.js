'use client';

import { useState, useEffect } from 'react';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import { formatDate } from '@/lib/utils/errorHandler';
import toast from 'react-hot-toast';


const AssignmentSubmissions = ({ assignment }) => {
  const { gradeSubmission} = useAssignmentStore();
  const [gradingStates, setGradingStates] = useState({});

   useEffect(() => {
    if (assignment?.submissions) {
      const initialStates = {};
      assignment.submissions.forEach(sub => {
        initialStates[sub._id] = {
          grade: sub.grade || '',
          feedback: sub.feedback || '',
          isSubmitting: false,
        };
      });
      setGradingStates(initialStates);
    }
  }, [assignment]);
 

  const handleInputChange = (submissionId, field, value) => {
    setGradingStates(prev => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], [field]: value },
    }));
  };

  const handleGradeSubmit = async (submissionId) => {
    const { grade, feedback } = gradingStates[submissionId];
    if (grade === '' || isNaN(parseFloat(grade))) {
        toast.error('Please enter a valid grade.');
        return;
    }
    
    setGradingStates(prev => ({ ...prev, [submissionId]: { ...prev[submissionId], isSubmitting: true } }));
    
    await gradeSubmission(assignment._id, submissionId, { grade: parseFloat(grade), feedback });
  };
    const submissions = assignment?.submissions || [];
  if (submissions.length === 0) {
    return <p className="text-gray-500 text-center py-4">No submissions yet for this assignment.</p>;
  }

  if (submissions.length === 0) {
    return <p className="text-gray-500 text-center py-4">No submissions yet for this assignment.</p>;
  }

  return (
    <div className="space-y-4 pt-4 mt-4 border-t border-gray-200">
      {submissions.map((sub) => {
        const state = gradingStates[sub._id] || { grade: '', feedback: '', isSubmitting: false };
        return (
          <div key={sub._id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{sub.student.name}</p>
                <p className="text-sm text-gray-500">Submitted: {formatDate(sub.submittedAt)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {sub.files.map(file => (
                        <a key={file.url} href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                            <FaDownload size={12}/> {file.name}
                        </a>
                    ))}
                </div>
              </div>
              <div>
                {sub.grade !== null && (
                    <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{sub.grade} / 100</p>
                        <p className="text-xs text-gray-500">Graded</p>
                    </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600">Feedback</label>
                <textarea
                  placeholder="Provide feedback..."
                  value={state.feedback}
                  onChange={(e) => handleInputChange(sub._id, 'feedback', e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-600">Grade</label>
                    <input
                      type="number"
                      placeholder="e.g., 85"
                      value={state.grade}
                      onChange={(e) => handleInputChange(sub._id, 'grade', e.target.value)}
                      className="w-24 mt-1 p-2 border rounded-md text-sm"
                    />
                </div>
                <button
                  onClick={() => handleGradeSubmit(sub._id)}
                  disabled={state.isSubmitting}
                  className="h-10 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  {state.isSubmitting ? <FaSpinner className="animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssignmentSubmissions;