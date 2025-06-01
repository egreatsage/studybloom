'use client';

import React, { useEffect } from 'react';
import useDepartmentStore from '@/lib/stores/departmentStore';
import { motion, AnimatePresence } from 'framer-motion';
import { confirmDialog } from '@/lib/utils/confirmDialog';
import DepartmentTable from '@/components/DepartmentTable';
import DepartmentForm from '@/components/DepartmentForm';
import ErrorBoundary from '@/components/ErrorBoundary';
import { FaPlus } from 'react-icons/fa';

export default function DepartmentsPage() {
  const {
    departments,
    fetchDepartments,
    addDepartment,
    editDepartment,
    deleteDepartment,
    loading,
    error,
  } = useDepartmentStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedDepartment, setSelectedDepartment] = React.useState(null);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (selectedDepartment) {
      await editDepartment(selectedDepartment._id, formData);
    } else {
      await addDepartment(formData);
    }
    closeModal();
  };

  const openModal = (department = null) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDepartment(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (departmentId) => {
    const confirmed = await confirmDialog('Are you sure you want to delete this department?');
    if (confirmed) {
      await deleteDepartment(departmentId);
    }
  };

  return (
    <div className="p-6">
      <ErrorBoundary>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Departments</h1>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Department</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        <DepartmentTable
          departments={departments}
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
                    {selectedDepartment ? 'Edit Department' : 'Add Department'}
                  </h2>
                </div>

                <DepartmentForm
                  defaultValues={selectedDepartment}
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
