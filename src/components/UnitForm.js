'use client';

import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';

const UnitForm = ({ onSubmit, loading, onClose, defaultValues, courseId }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      name: '',
      code: '',
      courseId: courseId || '',
    },
  });

  // Reset form when defaultValues change
  React.useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else if (courseId) {
      reset({ courseId });
    }
  }, [defaultValues, courseId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Unit Name</label>
        <input
          type="text"
          {...register('name', { 
            required: 'Unit name is required',
            minLength: {
              value: 3,
              message: 'Unit name must be at least 3 characters'
            }
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Unit Code</label>
        <input
          type="text"
          {...register('code', { 
            required: 'Unit code is required',
            pattern: {
              value: /^[A-Za-z0-9-]+$/,
              message: 'Unit code can only contain letters, numbers, and hyphens'
            }
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
        )}
      </div>

      {/* Hidden courseId field */}
      <input type="hidden" {...register('courseId')} />

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
              <span>Saving...</span>
            </>
          ) : (
            <span>Save</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default UnitForm;
