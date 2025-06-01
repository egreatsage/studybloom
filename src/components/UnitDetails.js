'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import AssignmentForm from './AssignmentForm';
import AssignmentsList from './AssignmentsList';

const UnitDetails = ({ unit, onCreateAssignment, onEditAssignment, onDeleteAssignment, canManageAssignments = false }) => {
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const handleCreateAssignment = (data) => {
    onCreateAssignment(data);
    setShowAssignmentForm(false);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setShowAssignmentForm(true);
  };

  const handleCloseForm = () => {
    setShowAssignmentForm(false);
    setEditingAssignment(null);
  };

  return (
    <div className="space-y-6">
      {/* Unit Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{unit.name}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Unit Code</p>
            <p className="text-gray-900">{unit.code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created By</p>
            <p className="text-gray-900">{unit.createdBy?.name || 'Unknown'}</p>
          </div>
        </div>
      </div>

      {/* Assignments Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Assignments</h3>
          {canManageAssignments && (
            <button
              onClick={() => setShowAssignmentForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaPlus />
              <span>Add Assignment</span>
            </button>
          )}
        </div>

        {/* Assignment Form Modal */}
        {showAssignmentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h4 className="text-lg font-semibold mb-4">
                {editingAssignment ? 'Edit Assignment' : 'New Assignment'}
              </h4>
              <AssignmentForm
                onSubmit={editingAssignment ? onEditAssignment : handleCreateAssignment}
                onClose={handleCloseForm}
                defaultValues={editingAssignment}
                unitId={unit._id}
              />
            </div>
          </div>
        )}

        {/* Assignments List */}
        <AssignmentsList
          assignments={unit.assignments || []}
          onEdit={canManageAssignments ? handleEditAssignment : undefined}
          onDelete={canManageAssignments ? onDeleteAssignment : undefined}
          canEdit={canManageAssignments}
          canDelete={canManageAssignments}
        />
      </div>
    </div>
  );
};

export default UnitDetails;
