'use client';

import { useState, useEffect, useMemo } from 'react';
import useTeachingStore from '@/lib/stores/teachingStore';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import { useSession } from 'next-auth/react';
import { confirmDialog } from '@/lib/utils/confirmDialog';
import { FaPlus, FaBookOpen, FaClipboardList } from 'react-icons/fa';
import AssignmentsList from '@/components/AssignmentsList';
import AssignmentForm from '@/components/AssignmentForm';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TeacherAssignmentsPage() {
  const { data: session } = useSession();
  const { assignments: teachingAssignments, fetchTeacherCourses, loading: teachingLoading } = useTeachingStore();
  const { fetchAssignments, createAssignment, updateAssignment, deleteAssignment, loading: assignmentLoading } = useAssignmentStore();

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTeacherCourses(session.user.id);
    }
  }, [session, fetchTeacherCourses]);

  const uniqueCourses = useMemo(() => {
    if (!teachingAssignments) return [];
    const courseMap = new Map();
    teachingAssignments.forEach(assignment => {
      if (assignment.course && !courseMap.has(assignment.course._id)) {
        courseMap.set(assignment.course._id, assignment.course);
      }
    });
    return Array.from(courseMap.values());
  }, [teachingAssignments]);

  const unitsForSelectedCourse = useMemo(() => {
    if (!selectedCourseId) return [];
    const relatedAssignments = teachingAssignments.filter(a => a.course?._id === selectedCourseId);
    const units = new Map();
    relatedAssignments.forEach(assignment => {
      assignment.units.forEach(unitInfo => {
        if (unitInfo.unit && !units.has(unitInfo.unit._id)) {
          units.set(unitInfo.unit._id, unitInfo.unit);
        }
      });
    });
    return Array.from(units.values());
  }, [selectedCourseId, teachingAssignments]);

  const handleSubmitAssignment = async (data) => {
    const assignmentData = {
      ...data,
      courseId: selectedCourseId,
      unitId: selectedUnitId,
    };
    closeModal(); // Close modal immediately for better UX
    if (editingAssignment) {
      await updateAssignment(editingAssignment._id, assignmentData);
    } else {
      await createAssignment(assignmentData);
    }
  };
  
  const openModal = (assignment = null) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingAssignment(null);
    setIsModalOpen(false);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    const confirmed = await confirmDialog('Are you sure you want to delete this assignment?');
    if (confirmed) {
      // FIX: Pass the selectedUnitId to the delete action
      await deleteAssignment(assignmentId, selectedUnitId);
    }
  };

  if (teachingLoading && !uniqueCourses.length) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaBookOpen className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
                <p className="text-gray-600 mt-1">Manage assignments and grade student submissions</p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="hidden lg:flex space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white min-w-[120px] text-center">
                <FaBookOpen className="text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold">{uniqueCourses.length}</p>
                <p className="text-sm opacity-90">Courses</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white min-w-[120px] text-center">
                <FaClipboardList className="text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold">{teachingAssignments.length}</p>
                <p className="text-sm opacity-90">Assignments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center"><FaBookOpen className="mr-2"/> Select Course</h2>
                <select 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedUnitId('');
                  }}
                  value={selectedCourseId}
                >
                  <option value="">Choose a course...</option>
                  {uniqueCourses.map(course => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              </div>
              {selectedCourseId && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center"><FaClipboardList className="mr-2"/> Select Unit</h2>
                  <select 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white disabled:opacity-50"
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    value={selectedUnitId}
                    disabled={unitsForSelectedCourse.length === 0}
                  >
                    <option value="">Choose a unit...</option>
                    {unitsForSelectedCourse.map(unit => (
                      <option key={unit._id} value={unit._id}>{unit.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedUnitId ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-2 py-5 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Assignments for {unitsForSelectedCourse.find(u => u._id === selectedUnitId)?.name}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Manage assignments and submissions</p>
                  </div>
                  <button 
                    onClick={() => openModal()} 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FaPlus className="mr-2" />
                    New Assignment
                  </button>
                </div>
              </div>
              <AssignmentsList
                  unitId={selectedUnitId}
                  isTeacher={true}
                  onEdit={openModal}
                  onDelete={handleDeleteAssignment}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBookOpen className="text-4xl text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Course & Unit</h3>
              <p className="text-gray-600 text-lg">Choose a course and unit from the sidebar to view and manage assignments</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AssignmentForm
              onSubmit={handleSubmitAssignment}
              onClose={closeModal}
              defaultValues={editingAssignment}
              unitId={selectedUnitId}
              loading={assignmentLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}