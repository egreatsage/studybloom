'use client';

import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';

const TeacherAssignmentForm = ({ onSubmit, loading, onClose, defaultValues, teachers, courses }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      teacherId: '',
      courseId: '',
    },
  });

  // Reset form when defaultValues change
  React.useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Teacher</label>
        <select
          {...register('teacherId', { required: 'Teacher is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a teacher</option>
          {teachers?.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.name}
            </option>
          ))}
        </select>
        {errors.teacherId && (
          <p className="mt-1 text-sm text-red-600">{errors.teacherId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Course</label>
        <select
          {...register('courseId', { required: 'Course is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a course</option>
          {courses?.map((course) => (
            <option key={course._id} value={course._id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
        {errors.courseId && (
          <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Assigning...</span>
            </>
          ) : (
            <span>Assign</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default TeacherAssignmentForm;
