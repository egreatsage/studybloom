'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';
import useSchoolStore from '@/lib/stores/schoolStore';

const DepartmentForm = ({ onSubmit, loading, onClose, defaultValues }) => {
  const { schools, fetchSchools } = useSchoolStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      school: '',
      name: '',
      head: '',
    },
  });

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">School</label>
        <select
          {...register('school', { required: 'School is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a school</option>
          {schools.map((school) => (
            <option key={school._id} value={school._id}>
              {school.name}
            </option>
          ))}
        </select>
        {errors.school && (
          <p className="mt-1 text-sm text-red-600">{errors.school.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Department Name</label>
        <input
          type="text"
          {...register('name', { required: 'Department name is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Department Head</label>
        <input
          type="text"
          {...register('head', { required: 'Department head is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.head && (
          <p className="mt-1 text-sm text-red-600">{errors.head.message}</p>
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

export default DepartmentForm;
