'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import useCourseStore from '@/lib/stores/courseStore';

const BulkUnitForm = ({ onSubmit, loading, onClose }) => {
  const { courses, fetchCourses, loading: coursesLoading } = useCourseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [units, setUnits] = useState([{ name: '', code: '' }]);
  
  // Fetch courses when component mounts
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSearchTerm(course.name);
    setShowDropdown(false);
  };

  const addUnit = () => {
    setUnits([...units, { name: '', code: '' }]);
  };

  const removeUnit = (index) => {
    const newUnits = units.filter((_, i) => i !== index);
    setUnits(newUnits);
  };

  const updateUnit = (index, field, value) => {
    const newUnits = [...units];
    newUnits[index][field] = value;
    setUnits(newUnits);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      alert('Please select a course');
      return;
    }

    const unitsData = units.filter(unit => unit.name && unit.code);
    if (unitsData.length === 0) {
      alert('Please add at least one unit with name and code');
      return;
    }

    onSubmit({
      courseId: selectedCourse._id,
      units: unitsData
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>

      <div className="space-y-4">
        {units.map((unit, index) => (
          <div key={index} className="flex space-x-4 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Unit Name</label>
              <input
                type="text"
                value={unit.name}
                onChange={(e) => updateUnit(index, 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter unit name"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Unit Code</label>
              <input
                type="text"
                value={unit.code}
                onChange={(e) => updateUnit(index, 'code', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter unit code"
              />
            </div>
            <button
              type="button"
              onClick={() => removeUnit(index)}
              className="mt-7 p-2 text-red-600 hover:text-red-800"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addUnit}
        className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
      >
        <FaPlus />
        <span>Add Another Unit</span>
      </button>

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
            <span>Save All Units</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default BulkUnitForm;
