"use client";

import React, { useEffect } from "react";
import useSchoolStore from "@/lib/stores/schoolStore";
import { motion, AnimatePresence } from "framer-motion";
import { confirmDialog } from "@/lib/utils/confirmDialog";
import SchoolTable from "@/components/SchoolTable";
import SchoolForm from "@/components/SchoolForm";
import ErrorBoundary from "@/components/ErrorBoundary";
import { FaSchool } from "react-icons/fa";

export default function SchoolsPage() {
  const { schools, fetchSchools, addSchool, updateSchool, deleteSchool, loading, error } = useSchoolStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedSchool, setSelectedSchool] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleSubmit = async (formData) => {
    if (selectedSchool) {
      await updateSchool(selectedSchool._id, formData);
    } else {
      await addSchool(formData);
    }
    closeModal();
  };

  const openModal = (school = null) => {
    setSelectedSchool(school);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSchool(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (schoolId) => {
    const confirmed = await confirmDialog('Are you sure you want to delete this school?');
    if (confirmed) {
      await deleteSchool(schoolId);
    }
  };

  // Filter schools based on search query (case-insensitive)
  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Schools</h1>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <FaSchool />
            <span>Add School</span>
          </button>
        </div>

        {/* Search input */}
        <div className="mb-4  flex justify-end w-52">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        <SchoolTable
          schools={filteredSchools}
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
                className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full max-h-[90vh] overflow-hidden"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {selectedSchool ? 'Edit School' : 'Add School'}
                  </h2>
                </div>

                <SchoolForm
                  initialData={selectedSchool}
                  onSubmit={handleSubmit}
                  onClose={closeModal}
                  loading={loading}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
