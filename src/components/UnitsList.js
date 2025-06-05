'use client';

import { FaTrash, FaEdit } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

const UnitsList = ({ units, loading, onEdit, onDelete, canEdit = false, canDelete = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!units || units.length === 0) {
    return <p>No units found for this course.</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Name</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Code</th>
          {(canEdit || canDelete) && (
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {units.map((unit) => (
          <tr key={unit._id}>
            <td className="px-4 py-2 whitespace-nowrap">{unit.name}</td>
            <td className="px-4 py-2 whitespace-nowrap">{unit.code}</td>
            {(canEdit || canDelete) && (
              <td className="px-4 py-2 whitespace-nowrap space-x-2">
                {canEdit && (
                  <button
                    onClick={() => onEdit(unit)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit unit"
                  >
                    <FaEdit />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(unit._id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete unit"
                  >
                    <FaTrash />
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UnitsList;
