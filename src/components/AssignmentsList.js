'use client';

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import AssignmentDetails from './AssignmentDetails';
import LoadingSpinner from './LoadingSpinner';

const AssignmentsList = ({ unitId, isTeacher = false, onEdit, onDelete }) => {
  const { assignments, loading, error, fetchAssignments } = useAssignmentStore();
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Fetch assignments only when unitId changes
  useEffect(() => {
    if (unitId) {
      fetchAssignments(unitId);
    }
  }, [unitId]); // FIX: Only depend on unitId

  if (loading) {
    return <div className="flex justify-center p-4"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!assignments?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No assignments found for this unit.</p>
        {isTeacher && (
          <button
            onClick={() => onEdit(null)}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Create the first assignment
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
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(assignment._id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Delete Assignment"
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