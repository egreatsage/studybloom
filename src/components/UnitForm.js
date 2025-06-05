'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import useCourseStore from '@/lib/stores/courseStore';

const UnitForm = ({ onSubmit, loading, onClose, defaultValues }) => {
  const { courses, fetchCourses, loading: coursesLoading } = useCourseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      name: '',
      code: '',
      courseId: '',
    },
  });

  // Fetch courses when component mounts
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
      const course = courses.find(c => c._id === defaultValues.courseId);
      if (course) {
        setSelectedCourse(course);
        setSearchTerm(course.name);
      }
    }
  }, [defaultValues, reset, courses]);

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSearchTerm(course.name);
    setValue('courseId', course._id);
    setShowDropdown(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Course</label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search for a course..."
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {coursesLoading ? (
              <FaSpinner className="animate-spin text-gray-400" />
            ) : (
              <FaSearch className="text-gray-400" />
            )}
          </div>
        </div>
        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
            <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <li
                    key={course._id}
                    onClick={() => handleCourseSelect(course)}
                    className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50"
                  >
                    <div className="flex items-center">
                      <span className="font-medium">{course.name}</span>
                      <span className="ml-2 text-sm text-gray-500">({course.code})</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500">
                  No courses found
                </li>
              )}
            </ul>
          </div>
        )}
        <input type="hidden" {...register('courseId', { required: 'Please select a course' })} />
        {errors.courseId && (
          <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p>
        )}
      </div>

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
          disabled={loading || coursesLoading}
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
