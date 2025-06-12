'use client';

import React, { useEffect, useState } from 'react';
import useCourseStore from '@/lib/stores/courseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { confirmDialog } from '@/lib/utils/confirmDialog';
import CourseTable from '@/components/CourseTable';
import CourseForm from '@/components/CourseForm';
import SemesterManager from '@/components/SemesterManager';
import ErrorBoundary from '@/components/ErrorBoundary';
import { FaPlus } from 'react-icons/fa';

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'semesters'
  const {
    courses,
    fetchCourses,
    addCourse,
    editCourse,
    deleteCourse,
    loading,
    error,
  } = useCourseStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filter courses based on search query (case-insensitive)
  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (selectedCourse) {
      await editCourse(selectedCourse._id, formData);
    } else {
      await addCourse(formData);
    }
    closeModal();
  };

  const openModal = (course = null) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (courseId) => {
    const confirmed = await confirmDialog('Are you sure you want to delete this course?');
    if (confirmed) {
      await deleteCourse(courseId);
    }
  };

  return (
    <div className="px-1">
      <ErrorBoundary>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Course Management</h1>
          
          </div>
          
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'courses'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('courses')}
            >
              Courses
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'semesters'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('semesters')}
            >
              Semester Management
            </button>
          </div>
        </div>
        {activeTab === 'courses' ? (
          <>
            {/* Search input */}
            <div className="mb-4 flex  justify-between items-center">
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 p-2 border border-gray-300 rounded-md"
              />
               <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
             
                <span>Add</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                {error}
              </div>
            )}

            <CourseTable
              courses={filteredCourses}
              loading={loading}
              onEdit={openModal}
              onDelete={handleDelete}
            />
          </>
        ) : (
          <SemesterManager />
        )}

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {selectedCourse ? 'Edit Course' : 'Add Course'}
                  </h2>
                </div>

                <CourseForm
                  defaultValues={selectedCourse}
                  onSubmit={handleSubmit}
                  onClose={closeModal}
                  loading={loading}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </div>
  );
}
