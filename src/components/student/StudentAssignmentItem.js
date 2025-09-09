'use client';

import { useState } from 'react';
import { FaChevronDown, FaLink, FaCheckCircle, FaHourglassHalf, FaClock, FaFileAlt, FaStar, FaBook,  FaScroll } from 'react-icons/fa';
import { formatDate } from '@/lib/utils/errorHandler';
import SubmissionForm from '../SubmissionForm';
import { IoMdPaper } from "react-icons/io";

const StudentAssignmentItem = ({ assignment, studentId, onSubmission }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const mySubmission = assignment.submissions?.[0];
  const isPastDue = new Date(assignment.dueDate) < new Date();
  const isGraded = mySubmission && typeof mySubmission.grade === 'number';

  const getAssessmentTypeInfo = () => {
    switch (assignment.assessmentType) {
      case 'CAT':
        return { icon: <IoMdPaper className="w-4 h-4 text-orange-600" />, label: 'CAT', color: 'bg-orange-100 text-orange-800' };
      case 'Exam':
        return { icon: <FaScroll className="w-4 h-4 text-red-600" />, label: 'Exam', color: 'bg-red-100 text-red-800' };
      case 'Assignment':
      default:
        return { icon: <FaBook className="w-4 h-4 text-blue-600" />, label: 'Assignment', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const { icon: assessmentIcon, label: assessmentLabel, color: assessmentColor } = getAssessmentTypeInfo();

  const getStatus = () => {
    if (isGraded) {
      const grade = mySubmission.grade;
      const gradeColor = grade >= (assignment.maxScore * 0.9) ? 'text-green-600' : grade >= (assignment.maxScore * 0.7) ? 'text-blue-600' : grade >= (assignment.maxScore * 0.5) ? 'text-yellow-600' : 'text-red-600';
      const bgColor = grade >= (assignment.maxScore * 0.9) ? 'bg-green-100 text-green-800' : grade >= (assignment.maxScore * 0.7) ? 'bg-blue-100 text-blue-800' : grade >= (assignment.maxScore * 0.5) ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
      
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FaStar className={`w-4 h-4 ${gradeColor}`} />
            <span className={`font-bold text-xl ${gradeColor}`}>{grade}/{assignment.maxScore}</span>
          </div>
          <span className={`px-3 py-1 text-xs font-medium ${bgColor} rounded-full shadow-sm`}>
            Graded
          </span>
        </div>
      );
    }
    if (mySubmission) {
      return <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full shadow-sm"><FaCheckCircle className="w-3 h-3" />Submitted</span>;
    }
    if (isPastDue) {
      return <span className="px-3 py-1.5 text-sm font-bold bg-red-200 text-red-600 rounded-full shadow-sm">Past Due</span>;
    }
    return <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full shadow-sm"><FaHourglassHalf className="w-3 h-3" />Pending</span>;
  };
  
  const getDueDateColor = () => {
    if (isPastDue) return 'text-red-600';
    const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 3) return 'text-orange-600';
    if (daysUntilDue <= 7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div 
        className="p-6 cursor-pointer hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className={`p-2 rounded-lg ${assessmentColor} flex-shrink-0`}>
                {assessmentIcon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 group-hover:text-blue-700 transition-colors">
                  {assignment.title}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                   <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${assessmentColor}`}>
                      {assessmentLabel}
                    </span>
                  <div className="flex items-center gap-2">
                    <FaClock className="w-3 h-3 text-gray-400" />
                    <span className={`font-medium ${getDueDateColor()}`}>
                      Due: {assignment.dueDate ? formatDate(assignment.dueDate) : 'No due date'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
            <div className="order-2 sm:order-1">
              {getStatus()}
            </div>
            <div className="order-1 sm:order-2">
              <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <FaChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
         <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-blue-50/20">
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Instructions
              </h4>
              <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
            </div>

            {assignment.fileUrl && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Attachment
                </h4>
                <a 
                  href={assignment.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors hover:text-blue-700"
                >
                  <FaLink className="w-4 h-4" />
                  Download Attachment
                </a>
              </div>
            )}

            {/* Submission Details */}
            {mySubmission ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" />
                    Your Submission Details
                  </h4>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Feedback Section */}
                  {isGraded && mySubmission.feedback && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-400">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <FaStar className="w-3 h-3" />
                        Feedback from Teacher
                      </p>
                      <blockquote className="text-gray-800 italic leading-relaxed font-medium">
                        "{mySubmission.feedback}"
                      </blockquote>
                    </div>
                  )}
                  
                  {/* Submitted Files */}
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <FaFileAlt className="w-3 h-3" />
                      Files Submitted
                    </p>
                    <div className="grid gap-2">
                      {mySubmission.files.map((file, index) => (
                        <a 
                          key={file.url || index}
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group border border-gray-200 hover:border-blue-200"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <FaFileAlt className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors truncate">
                            {file.name}
                          </span>
                          <FaLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors ml-auto flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : !isPastDue && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaFileAlt className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-600 mb-4">Ready to submit your assignment?</p>
                </div>
                <button 
                  onClick={() => setShowSubmissionForm(true)} 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FaFileAlt className="w-4 h-4" />
                  Submit Assignment
                </button>
              </div>
            )}
          </div>
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
