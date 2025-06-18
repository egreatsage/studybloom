'use client';

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaLink, FaFileAlt, FaClock, FaPlus, FaDownload } from 'react-icons/fa';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import AssignmentDetails from './AssignmentDetails';
import LoadingSpinner from './LoadingSpinner';
import Link from 'next/link';

const AssignmentsList = ({ unitId, isTeacher = false, onEdit, onDelete }) => {
  const { assignments, loading, error, fetchAssignments } = useAssignmentStore();
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    if (unitId) {
      fetchAssignments(unitId);
    }
  }, [unitId]);
  
  const createDownloadableLink = (url) => {
    if (!url) return '#';
    // Inserts 'fl_attachment/' after '/upload/' to force download
    return url.replace('/upload/', '/upload/fl_attachment/');
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' };
    } else {
      return { text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <FaFileAlt className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">Error Loading Assignments</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignments?.length) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <FaFileAlt className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Assignments Yet</h3>
          <p className="text-gray-600 mb-6">No assignments have been created for this unit.</p>
          {isTeacher && (
            <button
              onClick={() => onEdit(null)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaPlus className="w-4 h-4" />
              Create First Assignment
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {assignments.map((assignment, index) => {
        const dueDateInfo = formatDueDate(assignment.dueDate);
        
        return (
          <div
            key={assignment._id}
            className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:shadow-2xl hover:bg-white transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Assignment Content */}
              <div className="flex-1 space-y-4">
                {/* Title and Description */}
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md">
                      <FaFileAlt className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {assignment.title}
                      </h3>
                   
                    </div>
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Due Date Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${dueDateInfo.bg} ${dueDateInfo.color}`}>
                    <FaClock className="w-3 h-3" />
                    <span>{dueDateInfo.text}</span>
                  </div>

                  {/* Full Date */}
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>Due:</span>
                    <span className="font-medium">
                      {new Date(assignment.dueDate).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

             
              </div>

              {/* Action Buttons */}
              <div className="flex lg:flex-col gap-2 pt-2 lg:pt-0">
              <Link className='px-3 py-2 outline outline-amber-300 rounded-lg text-gray-700' href={"/student/assignments"}>
              View Assigment
              </Link>
              </div>
            </div>
          </div>
        );
      })}

      {selectedAssignment && (
        <AssignmentDetails
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          isTeacher={isTeacher}
        />
      )}
    </div>
  );
};

export default AssignmentsList;