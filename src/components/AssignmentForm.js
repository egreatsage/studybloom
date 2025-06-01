'use client';

import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';
import { handleError, handleSuccess } from '@/lib/utils/errorHandler';
import React from 'react';

const AssignmentForm = ({ onSubmit, loading, onClose, defaultValues, unitId }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      title: '',
      description: '',
      dueDate: '',
      unitId: unitId || '',
    },
  });

  // Reset form when defaultValues change
  React.useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else if (unitId) {
      reset({ unitId });
    }
  }, [defaultValues, unitId, reset]);

  const onSubmitHandler = async (data) => {
    try {
      await onSubmit(data);
      handleSuccess('Assignment saved successfully');
      onClose();
    } catch (error) {
      handleError(error, 'Failed to save assignment');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Assignment Title</label>
        <input
          type="text"
          {...register('title', { 
            required: 'Assignment title is required',
            minLength: {
              value: 3,
              message: 'Title must be at least 3 characters'
            }
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description', { 
            required: 'Description is required',
            minLength: {
              value: 10,
              message: 'Description must be at least 10 characters'
            }
          })}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="datetime-local"
          {...register('dueDate', { 
            required: 'Due date is required',
            validate: value => 
              new Date(value) > new Date() || 'Due date must be in the future'
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.dueDate && (
          <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
        )}
      </div>

      {/* Hidden unitId field */}
      <input type="hidden" {...register('unitId')} />

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

export default AssignmentForm;
