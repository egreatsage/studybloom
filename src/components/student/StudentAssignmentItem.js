'use client';

import { useState } from 'react';
import { FaChevronDown, FaLink, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import { formatDate } from '@/lib/utils/errorHandler';
import SubmissionForm from '../SubmissionForm'; // We will still need this for submitting

const StudentAssignmentItem = ({ assignment, studentId, onSubmission }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const mySubmission = assignment.submissions?.find(sub => sub.student === studentId);
  const isPastDue = new Date(assignment.dueDate) < new Date();

  const getStatus = () => {
    if (mySubmission?.grade) {
      return (
        <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-green-600">{mySubmission.grade}/100</span>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Graded</span>
        </div>
      );
    }
    if (mySubmission) {
      return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"><FaCheckCircle/> Submitted</span>;
    }
    if (isPastDue) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Past Due</span>;
    }
    return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full"><FaHourglassHalf/> Pending</span>;
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-center">
            <div>
                <p className="font-semibold">{assignment.title}</p>
                <p className="text-sm text-gray-500">Due: {formatDate(assignment.dueDate)}</p>
            </div>
            <div className="flex items-center gap-4">
                {getStatus()}
                <FaChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t bg-white space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Instructions</h4>
            <p className="text-gray-600 text-sm">{assignment.description}</p>
          </div>
          {assignment.fileUrl && (
            <div>
                <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"><FaLink/> Download Attachment</a>
            </div>
          )}

          {mySubmission ? (
            <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-semibold text-sm mb-2">Your Submission</h4>
                {mySubmission.feedback && (
                    <div className="mb-2">
                        <p className="text-xs font-bold text-gray-500">Feedback:</p>
                        <p className="text-gray-700 p-2 bg-yellow-50 border-l-4 border-yellow-300">{mySubmission.feedback}</p>
                    </div>
                )}
                <p className="text-xs font-bold text-gray-500">Files Submitted:</p>
                <ul className="list-disc pl-5">
                    {mySubmission.files.map(file => (
                        <li key={file.url} className="text-sm"><a href={file.url} className="text-blue-600 hover:underline">{file.name}</a></li>
                    ))}
                </ul>
            </div>
          ) : !isPastDue && (
            <div className="pt-4 border-t">
                <button onClick={() => setShowSubmissionForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit Assignment</button>
            </div>
          )}
        </div>
      )}

      {showSubmissionForm && (
        <SubmissionForm
            assignmentId={assignment._id}
            onClose={() => setShowSubmissionForm(false)}
            onSubmit={onSubmission}
        />
      )}
    </div>
  );
};

export default StudentAssignmentItem;