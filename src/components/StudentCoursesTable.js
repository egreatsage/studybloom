'use client';

import { FaTrash, FaBook, FaClipboardList } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const StudentCoursesTable = ({ 
  courses, 
  onRemove, 
  onViewUnits, 
  onCourseSelect,
  selectedCourseId,
  canRemove = false 
}) => {
  const router = useRouter();

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No courses enrolled.</p>
      </div>
    );
  }

  const handleRegisterUnits = () => {
    router.push('/student?tab=register');
  };

  return (
    <div className="space-y-4">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses.map((course) => (
            <tr 
              key={course._id}
              className={`hover:bg-gray-50 cursor-pointer ${
                selectedCourseId === course._id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onCourseSelect && onCourseSelect(course)}
            >
              <td className="px-4 py-2 whitespace-nowrap">{course.name}</td>
              <td className="px-4 py-2 whitespace-nowrap">{course.code}</td>
              <td className="px-4 py-2">
                <div className="max-w-xs truncate">{course.description || 'No description'}</div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {onViewUnits && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewUnits(course._id);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View course units"
                    >
                      <FaBook />
                    </button>
                  )}
                  {canRemove && onRemove && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(course._id);
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Drop course"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-4">
        <button
          onClick={handleRegisterUnits}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <FaClipboardList />
          <span>Register for Units</span>
        </button>
      </div>
    </div>
  );
};

export default StudentCoursesTable;
