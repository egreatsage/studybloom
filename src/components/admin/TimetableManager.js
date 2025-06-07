'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import timetableStore from '@/lib/stores/timetableStore';
import semesterStore from '@/lib/stores/semesterStore';
import courseStore from '@/lib/stores/courseStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaArchive, FaEye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { confirmDialog } from '@/lib/utils/confirmDialog';

export default function TimetableManager() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [formData, setFormData] = useState({
    semester: '',
    course: '',
    effectiveFrom: '',
    effectiveTo: '',
    metadata: {
      totalWeeks: 16,
      hoursPerWeek: 40
    }
  });

  const {
    timetables,
    loading,
    error,
    fetchTimetables,
    createTimetable,
    updateTimetable,
    deleteTimetable,
    publishTimetable
  } = timetableStore();

  const { semesters, fetchSemesters } = semesterStore();
  const { courses, fetchCourses } = courseStore();

  useEffect(() => {
    fetchTimetables();
    fetchSemesters();
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTimetable) {
        await updateTimetable(editingTimetable._id, formData);
      } else {
        await createTimetable(formData);
      }
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving timetable:', error);
    }
  };

  const handleEdit = (timetable) => {
    setEditingTimetable(timetable);
    setFormData({
      semester: timetable.semester._id,
      course: timetable.course._id,
      effectiveFrom: new Date(timetable.effectiveFrom).toISOString().split('T')[0],
      effectiveTo: new Date(timetable.effectiveTo).toISOString().split('T')[0],
      metadata: timetable.metadata || { totalWeeks: 16, hoursPerWeek: 40 }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog('Are you sure you want to delete this timetable? Note: Timetables with scheduled lectures cannot be deleted.');
    if (confirmed) {
      try {
        await deleteTimetable(id);
        toast.success('Timetable deleted successfully');
      } catch (error) {
        console.error('Error deleting timetable:', error);
        if (error.message === 'Cannot delete timetable with associated lectures') {
          toast.error('This timetable has scheduled lectures. Please delete all lectures first before deleting the timetable.');
        } else {
          toast.error(error.message || 'Failed to delete timetable');
        }
      }
    }
  };

  const handlePublish = async (id) => {
    const confirmed = await confirmDialog('Are you sure you want to publish this timetable? This will make it visible to students and teachers.');
    if (confirmed) {
      try {
        await publishTimetable(id);
        toast.success('Timetable published successfully');
      } catch (error) {
        console.error('Error publishing timetable:', error);
        toast.error(error.message || 'Failed to publish timetable');
      }
    }
  };

  const resetForm = () => {
    setEditingTimetable(null);
    setFormData({
      semester: '',
      course: '',
      effectiveFrom: '',
      effectiveTo: '',
      metadata: {
        totalWeeks: 16,
        hoursPerWeek: 40
      }
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Timetable Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Create Timetable
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Timetable Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTimetable ? 'Edit Timetable' : 'Create New Timetable'}
            </h2>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Semester */}
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
    <select
      value={formData.semester}
      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      required
      disabled={editingTimetable}
    >
      <option value="">Select Semester</option>
      {semesters.map(semester => (
        <option key={semester._id} value={semester._id}>
          {semester.name} ({new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()})
        </option>
      ))}
    </select>
  </div>

  {/* Course */}
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
    <select
      value={formData.course}
      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      required
      disabled={editingTimetable}
    >
      <option value="">Select Course</option>
      {courses.map(course => (
        <option key={course._id} value={course._id}>
          {course.code} - {course.name}
        </option>
      ))}
    </select>
  </div>

  {/* Date Fields */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
    <input
      type="date"
      value={formData.effectiveFrom}
      onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      required
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
    <input
      type="date"
      value={formData.effectiveTo}
      onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      required
    />
  </div>

  {/* Numeric Fields */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Total Weeks</label>
    <input
      type="number"
      value={formData.metadata.totalWeeks}
      onChange={(e) => setFormData({
        ...formData,
        metadata: { ...formData.metadata, totalWeeks: parseInt(e.target.value) }
      })}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      min="1"
      required
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Hours Per Week</label>
    <input
      type="number"
      value={formData.metadata.hoursPerWeek}
      onChange={(e) => setFormData({
        ...formData,
        metadata: { ...formData.metadata, hoursPerWeek: parseInt(e.target.value) }
      })}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      min="1"
      required
    />
  </div>

  {/* Buttons */}
  <div className="md:col-span-2 flex gap-3 mt-2">
    <button
      type="submit"
      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
    >
      {editingTimetable ? 'Update' : 'Create'}
    </button>
    <button
      type="button"
      onClick={() => {
        setShowForm(false);
        resetForm();
      }}
      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
    >
      Cancel
    </button>
  </div>
</form>
          </div>
        </div>
      )}

      {/* Timetables Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effective Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timetables.map((timetable) => (
              <tr key={timetable._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {timetable.semester?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {timetable.semester?.academicYear}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {timetable.course?.code}
                  </div>
                  <div className="text-sm text-gray-500">
                    {timetable.course?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(timetable.effectiveFrom).toLocaleDateString()} - {new Date(timetable.effectiveTo).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(timetable.status)}`}>
                    {timetable.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {timetable.createdBy?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/timetables/${timetable._id}/schedule`)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Manage Schedule"
                    >
                      <FaEye />
                    </button>
                    {timetable.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleEdit(timetable)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handlePublish(timetable._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Publish"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleDelete(timetable._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                    {timetable.status === 'published' && (
                      <button
                        className="text-gray-400 cursor-not-allowed"
                        title="Published timetables cannot be edited"
                      >
                        <FaArchive />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {timetables.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No timetables found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
