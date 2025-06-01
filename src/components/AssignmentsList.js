'use client';

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import { handleError, handleSuccess } from '@/lib/utils/errorHandler';
import AssignmentDetails from './AssignmentDetails';
import LoadingSpinner from './LoadingSpinner';

const AssignmentsList = ({ unitId, isTeacher = false }) => {
  const { assignments, loading, error, fetchAssignments, deleteAssignment } = useAssignmentStore();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch assignments when unitId changes
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        if (unitId) {
          await fetchAssignments({ unitId });
        }
      } catch (error) {
        handleError(error, 'Failed to load assignments');
      }
    };
    loadAssignments();
  }, [unitId, fetchAssignments]);

  const handleDelete = async (assignmentId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this assignment?')) {
        return;
      }
      
      setIsDeleting(true);
      await deleteAssignment(assignmentId);
      handleSuccess('Assignment deleted successfully');
    } catch (error) {
      handleError(error, 'Failed to delete assignment');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={() => fetchAssignments({ unitId })}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!assignments?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No assignments found for this unit.</p>
        {isTeacher && (
          <button
            onClick={() => setSelectedAssignment({ unitId })}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Create your first assignment
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div
          key={assignment._id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{assignment.title}</h3>
              <p className="text-gray-600 mt-1">{assignment.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Due: {new Date(assignment.dueDate).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedAssignment(assignment)}
                className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                title="View Details"
              >
                <FaEye />
              </button>
              {isTeacher && (
                <>
                  <button
                    onClick={() => onEdit(assignment)}
                    className="p-2 text-green-600 hover:text-green-800 transition-colors"
                    title="Edit Assignment"
                    disabled={isDeleting}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment._id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Delete Assignment"
                    disabled={isDeleting}
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

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
