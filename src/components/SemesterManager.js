'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSemesterStore from '@/lib/stores/semesterStore';
import useCourseStore from '@/lib/stores/courseStore';
import useUnitStore from '@/lib/stores/unitStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { confirmDialog } from '@/lib/utils/confirmDialog';

export default function SemesterManager() {
  const {
    semesters,
    fetchSemesters,
    addSemester,
    editSemester,
    deleteSemester,
    loading,
    error,
  } = useSemesterStore();

  const { courses, fetchCourses } = useCourseStore();
  const { units, fetchUnits } = useUnitStore();

  const [selectedSemester, setSelectedSemester] = useState(null);
  const [semesterName, setSemesterName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationStartDate, setRegistrationStartDate] = useState('');
  const [registrationEndDate, setRegistrationEndDate] = useState('');
  const [maxUnitsPerStudent, setMaxUnitsPerStudent] = useState(8);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingUnits, setIsSavingUnits] = useState(false);
  const [courseUnits, setCourseUnits] = useState([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  useEffect(() => {
    fetchSemesters();
    fetchCourses();
  }, [fetchSemesters, fetchCourses]);

  useEffect(() => {
    if (selectedSemester) {
      setSemesterName(selectedSemester.name);
      setStartDate(selectedSemester.startDate ? selectedSemester.startDate.slice(0, 10) : '');
      setEndDate(selectedSemester.endDate ? selectedSemester.endDate.slice(0, 10) : '');
      setRegistrationStartDate(selectedSemester.registrationStartDate ? selectedSemester.registrationStartDate.slice(0, 10) : '');
      setRegistrationEndDate(selectedSemester.registrationEndDate ? selectedSemester.registrationEndDate.slice(0, 10) : '');
      setMaxUnitsPerStudent(selectedSemester.maxUnitsPerStudent || 8);
      setSelectedUnits(selectedSemester.units ? selectedSemester.units.map(u => u._id) : []);
    } else {
      setSemesterName('');
      setStartDate('');
      setEndDate('');
      setRegistrationStartDate('');
      setRegistrationEndDate('');
      setMaxUnitsPerStudent(8);
      setSelectedUnits([]);
      setSelectedCourse('');
      setCourseSearch('');
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedCourse) {
      fetchUnits(selectedCourse);
    }
  }, [selectedCourse, fetchUnits]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.course-search-container')) {
        setShowCourseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedCourse && units) {
      setCourseUnits(units.filter(unit => {
        const courseId = unit.course?._id || unit.course || unit.courseId;
        return courseId === selectedCourse;
      }));
    } else {
      setCourseUnits([]);
    }
  }, [selectedCourse, units]);

  const handleSemesterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const semesterData = {
        name: semesterName,
        startDate,
        endDate,
        registrationStartDate,
        registrationEndDate,
        maxUnitsPerStudent: parseInt(maxUnitsPerStudent)
      };
      
      if (selectedSemester) {
        await editSemester(selectedSemester._id, semesterData);
        // toast.success('Semester updated successfully!');
      } else {
        await addSemester(semesterData);
        // toast.success('Semester added successfully!',{duration:2000});
      }
      setSelectedSemester(null);
      await fetchSemesters();
    } catch (error) {
      toast.error('Failed to save semester');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSemester = async () => {
    if (!selectedSemester) return;
    
    const confirmDelete = await confirmDialog(
      `Are you sure you want to delete "${selectedSemester.name}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        await deleteSemester(selectedSemester._id);
        setSelectedSemester(null);
        // toast.success('Semester deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete semester');
      }
    }
  };

  const handleUnitToggle = (unitId) => {
    if (selectedUnits.includes(unitId)) {
      setSelectedUnits(selectedUnits.filter(id => id !== unitId));
    } else {
      setSelectedUnits([...selectedUnits, unitId]);
    }
  };

  const handleSaveUnits = async () => {
    if (!selectedSemester) return;
    
    setIsSavingUnits(true);
    
    try {
      // Get current units in the semester
      const currentUnitIds = selectedSemester.units ? selectedSemester.units.map(u => u._id) : [];
      
      // Determine which units to add and remove
      const toAdd = selectedUnits.filter(id => !currentUnitIds.includes(id));
      const toRemove = currentUnitIds.filter(id => !selectedUnits.includes(id));

      // Add new units if any
      if (toAdd.length > 0) {
        const res = await fetch(`/api/semesters/${selectedSemester._id}/units`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unitIds: toAdd })
        });
        if (!res.ok) throw new Error('Failed to add units to semester');
      }

      // Remove units if any
      if (toRemove.length > 0) {
        const res = await fetch(`/api/semesters/${selectedSemester._id}/units`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unitIds: toRemove })
        });
        if (!res.ok) throw new Error('Failed to remove units from semester');
      }

      // Refresh the selected semester with updated units
      const res = await fetch(`/api/semesters/${selectedSemester._id}`);
      if (!res.ok) throw new Error('Failed to refresh semester data');
      const data = await res.json();
      setSelectedSemester(data.semester);
      
      toast.success('Units updated successfully!');
    } catch (error) {
      console.error('Error updating semester units:', error);
      toast.error(error.message);
    } finally {
      setIsSavingUnits(false);
    }
  };

  // Group units by course for display
  const groupUnitsByCourse = (units) => {
    const grouped = {};
    units.forEach(unit => {
      const courseName = unit.course?.name || 'Unknown Course';
      if (!grouped[courseName]) {
        grouped[courseName] = [];
      }
      grouped[courseName].push(unit);
    });
    return grouped;
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Semesters</h2>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Semester List */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-lg text-gray-700">Semesters</h3>
            <ul className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto bg-white">
              {semesters.length === 0 ? (
                <li className="p-4 text-gray-500 text-center">No semesters found</li>
              ) : (
                semesters.map((sem) => (
                  <li
                    key={sem._id}
                    className={`p-3 cursor-pointer transition-colors duration-200 border-b last:border-b-0 ${
                      selectedSemester?._id === sem._id 
                        ? 'bg-blue-100 hover:bg-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSemester(sem)}
                  >
                    <div className="font-medium text-gray-800">{sem.name}</div>
                    <div className="text-sm text-gray-600">
                      {sem.startDate?.slice(0, 10)} - {sem.endDate?.slice(0, 10)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {sem.units?.length || 0} units offered
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                onClick={() => setSelectedSemester(null)}
                disabled={loading}
              >
                + Add New Semester
              </button>
              {selectedSemester && (
                <button
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                  onClick={handleDeleteSemester}
                  disabled={loading}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Semester Form and Unit Management */}
        <div className="w-full lg:w-2/3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-lg text-gray-700">
              {selectedSemester ? 'Edit Semester' : 'Add New Semester'}
            </h3>
            <form onSubmit={handleSemesterSubmit} className="mb-6">
              <div className="space-y-4">
                {/* Basic Semester Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Semester Name
                    </label>
                    <input
                      type="text"
                      value={semesterName}
                      onChange={(e) => setSemesterName(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Semester One "
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Registration Period Information */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Registration Period Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Registration Start Date
                      </label>
                      <input
                        type="date"
                        value={registrationStartDate}
                        onChange={(e) => setRegistrationStartDate(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Registration End Date
                      </label>
                      <input
                        type="date"
                        value={registrationEndDate}
                        onChange={(e) => setRegistrationEndDate(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Max Units Per Student
                      </label>
                      <input
                        type="number"
                        value={maxUnitsPerStudent}
                        onChange={(e) => setMaxUnitsPerStudent(e.target.value)}
                        min="1"
                        max="20"
                        required
                        disabled={isSubmitting}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <LoadingSpinner size="small" />}
                  {selectedSemester ? 'Update Semester' : 'Add Semester'}
                </button>
              </div>
            </form>

            {selectedSemester && (
              <>
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3 text-lg text-gray-700">
                    Manage Units on Offer
                  </h3>
                  
                  {/* Course Selection */}
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Course to View Units
                    </label>
                    <div className="relative course-search-container">
                      <input
                        type="text"
                        value={courseSearch}
                        onChange={(e) => {
                          setCourseSearch(e.target.value);
                          setShowCourseDropdown(true);
                        }}
                        onFocus={() => setShowCourseDropdown(true)}
                        placeholder="Search for a course by name or code..."
                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      
                      {/* Dropdown for filtered courses */}
                      {showCourseDropdown && courseSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {courses
                            .filter(course => 
                              course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
                              course.code.toLowerCase().includes(courseSearch.toLowerCase())
                            )
                            .map(course => (
                              <div
                                key={course._id}
                                onClick={() => {
                                  setSelectedCourse(course._id);
                                  setCourseSearch(`${course.code} - ${course.name}`);
                                  setShowCourseDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                              >
                                <div className="font-medium text-gray-800">
                                  {course.code} - {course.name}
                                </div>
                                {course.department?.name && (
                                  <div className="text-sm text-gray-500">{course.department.name}</div>
                                )}
                              </div>
                            ))
                          }
                          {courses.filter(course => 
                            course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
                            course.code.toLowerCase().includes(courseSearch.toLowerCase())
                          ).length === 0 && (
                            <div className="px-3 py-2 text-gray-500 text-center">
                              No courses found
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Show all courses when focused but no search term */}
                      {showCourseDropdown && !courseSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {courses.map(course => (
                            <div
                              key={course._id}
                              onClick={() => {
                                setSelectedCourse(course._id);
                                setCourseSearch(`${course.code} - ${course.name}`);
                                setShowCourseDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                            >
                              <div className="font-medium text-gray-800">
                                {course.code} - {course.name}
                              </div>
                              {course.department?.name && (
                                <div className="text-sm text-gray-500">{course.department.name}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Show selected course info */}
                    {selectedCourse && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected: {courseSearch}
                      </p>
                    )}
                  </div>

                  {/* Units Selection */}
                  {selectedCourse && (
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white mb-4">
                      {courseUnits.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No units available for this course</p>
                      ) : (
                        courseUnits.map((unit) => (
                          <label 
                            key={unit._id} 
                            className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-200"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUnits.includes(unit._id)}
                              onChange={() => handleUnitToggle(unit._id)}
                              className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                              disabled={isSavingUnits}
                            />
                            <span className="text-gray-700">
                              {unit.name} <span className="text-gray-500">({unit.code})</span>
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                  
                  <button
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={handleSaveUnits}
                    disabled={isSavingUnits || !selectedCourse}
                  >
                    {isSavingUnits && <LoadingSpinner size="small" />}
                    Save Unit Selection
                  </button>
                </div>

                <div className="border-t mt-6 pt-6">
                  <h3 className="font-semibold mb-3 text-lg text-gray-700">
                    Units Offered in This Semester
                  </h3>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                    {selectedSemester.units && selectedSemester.units.length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(groupUnitsByCourse(selectedSemester.units)).map(([courseName, units]) => (
                          <div key={courseName}>
                            <h4 className="font-medium text-gray-700 mb-2">{courseName}</h4>
                            <ul className="space-y-1 ml-4">
                              {units.map((unit) => (
                                <li key={unit._id} className="p-2 bg-gray-50 rounded">
                                  <span className="text-gray-800">{unit.name}</span>
                                  <span className="text-gray-600 ml-2">({unit.code})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No units assigned to this semester.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
