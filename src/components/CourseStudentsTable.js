'use client';

import { FaTrash } from 'react-icons/fa';

const CourseStudentsTable = ({ students, onRemove, canRemove = false }) => {
  if (!students || students.length === 0) {
    return <p>No students enrolled in this course.</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
          {canRemove && (
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {students.map((student) => (
          <tr key={student._id}>
            <td className="px-4 py-2 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-8 w-8 flex-shrink-0">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={student.photoUrl || '/default-profile.png'}
                    alt={student.name}
                  />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                </div>
              </div>
            </td>
            <td className="px-4 py-2 whitespace-nowrap">
              <div className="text-sm text-gray-900">{student.email}</div>
            </td>
            <td className="px-4 py-2 whitespace-nowrap">
              <div className="text-sm text-gray-900">{student.phoneNumber || 'N/A'}</div>
            </td>
            {canRemove && (
              <td className="px-4 py-2 whitespace-nowrap">
                <button
                  onClick={() => onRemove(student._id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Remove student from course"
                >
                  <FaTrash />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CourseStudentsTable;
