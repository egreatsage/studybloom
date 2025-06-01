'use client';

import React, { useEffect } from 'react';
import useCourseStore from '@/lib/stores/courseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { confirmDialog } from '@/lib/utils/confirmDialog';
import CourseTable from '@/components/CourseTable';
import CourseForm from '@/components/CourseForm';
import ErrorBoundary from '@/components/ErrorBoundary';
import { FaPlus } from 'react-icons/fa';

export default function CoursesPage() {
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

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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
    <div className="p-6">
      <ErrorBoundary>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Course</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        <CourseTable
          courses={courses}
          loading={loading}
          onEdit={openModal}
          onDelete={handleDelete}
        />

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
