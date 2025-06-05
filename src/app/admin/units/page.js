  'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { confirmDialog } from '@/lib/utils/confirmDialog';
import ErrorBoundary from '@/components/ErrorBoundary';
import { FaPlus } from 'react-icons/fa';
import useUnitStore from '@/lib/stores/unitStore';
import useCourseStore from '@/lib/stores/courseStore';
import UnitsList from '@/components/UnitsList';
import UnitForm from '@/components/UnitForm';

export default function UnitsPage() {
  const {
    units,
    fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    loading,
    error,
  } = useUnitStore();

  const { courses, fetchCourses } = useCourseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
    // Fetch all units initially
    fetchUnits('all');
  }, [fetchCourses, fetchUnits]);

  // Filter units based on search term
  const filteredUnits = units.filter(unit => {
    const searchLower = searchTerm.toLowerCase();
    const course = courses.find(c => c._id === unit.courseId);
    return unit.name.toLowerCase().includes(searchLower) || 
           unit.code.toLowerCase().includes(searchLower) ||
           course?.name.toLowerCase().includes(searchLower) ||
           course?.code.toLowerCase().includes(searchLower);
  });

  const handleSubmit = async (data) => {
    try {
      if (selectedUnit) {
        await updateUnit(selectedUnit._id, data);
      } else {
        await createUnit(data);
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save unit:', error);
    }
  };

  const openModal = (unit = null) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUnit(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (unitId) => {
    const confirmed = await confirmDialog('Are you sure you want to delete this unit?');
    if (confirmed) {
      await deleteUnit(unitId);
    }
  };

  return (
    <div className="p-6">
      <ErrorBoundary>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Units</h1>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Unit</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Units by Unit Name or Course Name
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search units..."
            className="w-52 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <UnitsList
          units={filteredUnits}
          loading={loading}
          onEdit={openModal}
          onDelete={handleDelete}
          canEdit={true}
          canDelete={true}
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
                    {selectedUnit ? 'Edit Unit' : 'Add Unit'}
                  </h2>
                </div>

                <UnitForm
                  defaultValues={selectedUnit}
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
