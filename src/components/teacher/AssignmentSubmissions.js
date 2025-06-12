'use client';

import { useState, useEffect, useMemo } from 'react';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import { FaDownload, FaSpinner, FaUser, FaClock, FaCheck, FaGraduationCap, FaFileAlt, FaCommentAlt, FaStar, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatDate } from '@/lib/utils/errorHandler';
import toast from 'react-hot-toast';

const AssignmentSubmissions = ({ assignment }) => {
  const { gradeSubmission } = useAssignmentStore();
  const [expandedSubmissions, setExpandedSubmissions] = useState(new Set());
  
  // Pagination states
  const [ungradedPage, setUngradedPage] = useState(1);
  const [gradedPage, setGradedPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Separate and paginate submissions
  const { ungradedSubmissions, gradedSubmissions, ungradedTotal, gradedTotal } = useMemo(() => {
    const submissions = assignment?.submissions || [];
    const ungraded = submissions.filter(sub => sub.grade === null);
    const graded = submissions.filter(sub => sub.grade !== null);
    
    return {
      ungradedSubmissions: ungraded,
      gradedSubmissions: graded,
      ungradedTotal: ungraded.length,
      gradedTotal: graded.length
    };
  }, [assignment?.submissions]);

  // Get paginated data
  const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const paginatedUngraded = getPaginatedData(ungradedSubmissions, ungradedPage);
  const paginatedGraded = getPaginatedData(gradedSubmissions, gradedPage);

  const getTotalPages = (total) => Math.ceil(total / ITEMS_PER_PAGE);


  const toggleExpanded = (submissionId) => {
    setExpandedSubmissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600 bg-green-50';
    if (grade >= 80) return 'text-blue-600 bg-blue-50';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-50';
    if (grade >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const PaginationControls = ({ currentPage, totalPages, onPageChange, label }) => (
    <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">
        {label} - Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaChevronLeft className="mr-1" />
          Previous
        </button>
        <span className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md">
          {currentPage}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <FaChevronRight className="ml-1" />
        </button>
      </div>
    </div>
  );

  const SubmissionCard = ({ sub, isExpanded }) => {
    console.log("submission object",sub)
    const [grade, setGrade] = useState(sub.grade || '');
    const [feedback, setFeedback] = useState(sub.feedback || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isGraded = sub.grade !== null;

    const handleGradeSubmit = async () => {
      if (grade === '' || isNaN(parseFloat(grade))) {
        toast.error('Please enter a valid grade.');
        return;
      }
      
      setIsSubmitting(true);
      
      await gradeSubmission(assignment._id, sub._id, { 
        grade: parseFloat(grade), 
        feedback 
      });
      
      setIsSubmitting(false);
    };
    
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Compact Header - Always Visible */}
        <div className="p-4 cursor-pointer" onClick={() => toggleExpanded(sub._id)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">{sub.student.name}</h5>
                <h5 className="font-semibold text-gray-900">{sub.student.regNumber}</h5>
                <div className="flex items-center text-xs text-gray-500">
                  <FaClock className="mr-1" />
                  {formatDate(sub.submittedAt)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isGraded && (
                <div className={`px-3 py-1 rounded-full font-bold text-sm ${getGradeColor(sub.grade)}`}>
                  {sub.grade}/100
                </div>
              )}
              <button className="text-gray-400 hover:text-gray-600">
                {isExpanded ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Content - Lazy Loaded */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
            {/* Files Section */}
            {sub.files && sub.files.length > 0 && (
              <div className="mb-4 mt-4">
                <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaFileAlt className="mr-1" />
                  Submitted Files ({sub.files.length})
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sub.files.map((file, index) => (
                    <a 
                      key={index}
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center p-2 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors duration-200 group"
                    >
                      <FaDownload className="text-indigo-600 group-hover:text-indigo-700 mr-2 flex-shrink-0 text-sm" />
                      <span className="text-sm text-gray-700 group-hover:text-indigo-700 truncate">{file.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Grading Section */}
            <div className="bg-gray-50 rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Feedback */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaCommentAlt className="mr-1" />
                    Feedback
                  </label>
                  <textarea
                    placeholder="Provide detailed feedback for the student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={3}
                  />
                </div>

                {/* Grade and Submit */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaStar className="mr-1" />
                      Grade (out of 100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="85"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <button
                    onClick={handleGradeSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        Save Grade
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (ungradedTotal === 0 && gradedTotal === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="text-2xl text-gray-400" />
        </div>
        <h4 className="text-lg font-semibold text-gray-700 mb-2">No submissions yet</h4>
        <p className="text-gray-500">Students haven't submitted their work for this assignment.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold mb-2 flex items-center">
              <FaGraduationCap className="mr-2" />
              Assignment Submissions
            </h4>
            <div className="flex space-x-6 text-sm">
              <div>Total: {ungradedTotal + gradedTotal}</div>
              <div>Graded: {gradedTotal}</div>
              <div>Pending: {ungradedTotal}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {ungradedTotal + gradedTotal > 0 ? Math.round((gradedTotal / (ungradedTotal + gradedTotal)) * 100) : 0}%
            </div>
            <div className="text-sm opacity-90">Complete</div>
          </div>
        </div>
      </div>

      {/* Ungraded Submissions Section */}
      {ungradedTotal > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-semibold text-orange-600 flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              Pending Grading ({ungradedTotal})
            </h5>
          </div>
          
          <div className="space-y-4">
            {paginatedUngraded.map((sub) => (
              <SubmissionCard 
                key={sub._id} 
                sub={sub} 
                isExpanded={expandedSubmissions.has(sub._id)} 
              />
            ))}
          </div>

          {getTotalPages(ungradedTotal) > 1 && (
            <PaginationControls
              currentPage={ungradedPage}
              totalPages={getTotalPages(ungradedTotal)}
              onPageChange={setUngradedPage}
              label="Ungraded Submissions"
            />
          )}
        </div>
      )}

      {/* Graded Submissions Section */}
      {gradedTotal > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-semibold text-green-600 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Graded Submissions ({gradedTotal})
            </h5>
          </div>
          
          <div className="space-y-4">
            {paginatedGraded.map((sub) => (
              <SubmissionCard 
                key={sub._id} 
                sub={sub} 
                isExpanded={expandedSubmissions.has(sub._id)} 
              />
            ))}
          </div>

          {getTotalPages(gradedTotal) > 1 && (
            <PaginationControls
              currentPage={gradedPage}
              totalPages={getTotalPages(gradedTotal)}
              onPageChange={setGradedPage}
              label="Graded Submissions"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissions;
