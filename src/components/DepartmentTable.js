'use client';

import { FaEdit, FaTrash } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

const DepartmentTable = ({ departments, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!departments?.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">School</th>
            <th className="px-4 py-3 text-left">Department Name</th>
            <th className="px-4 py-3 text-left">Department Head</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {departments.map((dept) => (
            <tr key={dept._id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{dept.school?.name || '-'}</td>
              <td className="px-4 py-3">{dept.name}</td>
              <td className="px-4 py-3">{dept.head}</td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(dept)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(dept._id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DepartmentTable;
