'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CourseForm = ({ onSubmit, loading, onClose, defaultValues }) => {
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues ? {
      name: defaultValues.name || '',
      code: defaultValues.code || '',
      description: defaultValues.description || '',
      school: defaultValues.school?._id || '',
      department: defaultValues.department?._id || '',
    } : {
      name: '',
      code: '',
      description: '',
      school: '',
      department: '',
    },
  });

  const selectedSchool = watch('school');

  // Fetch departments for a school
  const fetchDepartments = async (schoolId) => {
    if (!schoolId) {
      setDepartments([]);
      return;
    }
    setLoadingDepartments(true);
    try {
      const res = await fetch(`/api/departments?schoolId=${schoolId}`);
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (error) {
      toast.error('Failed to load departments');
      console.error('Error fetching departments:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // When editing, fetch departments for the selected school
  useEffect(() => {
    if (defaultValues?.school?._id) {
      fetchDepartments(defaultValues.school._id);
    }
  }, [defaultValues]);

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      setLoadingSchools(true);
      try {
        const res = await fetch('/api/schools');
        if (!res.ok) throw new Error('Failed to fetch schools');
        const data = await res.json();
        setSchools(data.schools || []);
      } catch (error) {
        toast.error('Failed to load schools');
        console.error('Error fetching schools:', error);
      } finally {
        setLoadingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  // Fetch departments when school is selected
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedSchool) {
        setDepartments([]);
        return;
      }
      setLoadingDepartments(true);
      try {
        const res = await fetch(`/api/departments?schoolId=${selectedSchool}`);
        if (!res.ok) console.log('Failed to fetch departments');
        const data = await res.json();
        setDepartments(data.departments || []);
      } catch (error) {
        console.error('Failed to load departments');
        console.error('Error fetching departments:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, [selectedSchool]);

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* School Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">School</label>
        <select
          {...register('school', { required: 'School is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loadingSchools}
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

      {/* Department Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Department</label>
        <select
          {...register('department', { required: 'Department is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={!selectedSchool || loadingDepartments}
        >
          <option value="">Select a department</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
        {errors.department && (
          <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Course Name</label>
        <input
          type="text"
          {...register('name', { required: 'Course name is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Course Code</label>
        <input
          type="text"
          {...register('code', { required: 'Course code is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
        />
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

export default CourseForm;
