'use client';

const CourseTeachersTable = ({ teachers }) => {
  if (!teachers || teachers.length === 0) {
    return <p>No teachers assigned to this course.</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {teachers.map((teacher) => (
          <tr key={teacher._id}>
            <td className="px-4 py-2 whitespace-nowrap">{teacher.name}</td>
            <td className="px-4 py-2 whitespace-nowrap">{teacher.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CourseTeachersTable;
