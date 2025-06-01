'use client';

import { FaEdit, FaTrash } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

const SchoolTable = ({ schools, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!schools?.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No schools found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">School Name</th>
            <th className="px-4 py-3 text-left">Dean</th>
            <th className="px-4 py-3 text-left">Last Updated</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {schools.map((school) => (
            <tr key={school._id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{school.name}</td>
              <td className="px-4 py-3">{school.dean}</td>
              <td className="px-4 py-3">
                {new Date(school.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(school)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Edit school"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(school._id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete school"
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

export default SchoolTable;
