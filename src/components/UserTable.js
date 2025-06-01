'use client';

import { FaEdit, FaTrash } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

const UserTable = ({ users, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">Photo</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Phone</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <img
                  src={user.photoUrl || "/default-profile.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </td>
              <td className="px-4 py-3">{user.name}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.phoneNumber || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(user._id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
