"use client";

import React, { useEffect } from "react";
import useUserStore from "@/lib/stores/userStore";
import { motion, AnimatePresence } from "framer-motion";
import { confirmDialog } from "@/lib/utils/confirmDialog";
import UserTable from "@/components/UserTable";
import UserForm from "@/components/UserForm";
import ErrorBoundary from "@/components/ErrorBoundary";
import { FaUserPlus } from "react-icons/fa";

export default function UsersPage() {
  const { users, fetchUsers, addUser, editUser, deleteUser, loading, error } = useUserStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (formData) => {
    if (selectedUser) {
      await editUser(selectedUser._id, formData);
    } else {
      await addUser(formData);
    }
    closeModal();
  };

  const openModal = (user = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (userId) => {
    const confirmed = await confirmDialog('Are you sure you want to delete this user?');
    if (confirmed) {
      await deleteUser(userId);
    }
  };

  return (
    <div>
      <ErrorBoundary>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Users</h1>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaUserPlus />
            <span>Add </span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        <UserTable
          users={users}
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
                    {selectedUser ? 'Edit User' : 'Add User'}
                  </h2>
                </div>

                <UserForm
                  defaultValues={selectedUser}
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
