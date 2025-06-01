'use client';

import { FaTrash } from 'react-icons/fa';

const TeacherCoursesTable = ({ courses, onRemove, canRemove = false }) => {
  if (!courses || courses.length === 0) {
    return <p>No courses assigned to this teacher.</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
          {canRemove && (
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {courses.map((course) => (
          <tr key={course._id}>
            <td className="px-4 py-2 whitespace-nowrap">{course.name}</td>
            <td className="px-4 py-2 whitespace-nowrap">{course.code}</td>
            <td className="px-4 py-2">
              <div className="max-w-xs truncate">{course.description || 'No description'}</div>
            </td>
            {canRemove && (
              <td className="px-4 py-2 whitespace-nowrap">
                <button
                  onClick={() => onRemove(course._id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Remove course assignment"
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

export default TeacherCoursesTable;
