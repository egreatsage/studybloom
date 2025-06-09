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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Assignment Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center"><FaBookOpen className="mr-2"/> Select Course</h2>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedUnitId('');
                }}
                value={selectedCourseId}
              >
                <option value="">-- Select a Course --</option>
                {uniqueCourses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>
            {selectedCourseId && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center"><FaClipboardList className="mr-2"/> Select Unit</h2>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  value={selectedUnitId}
                >
                  <option value="">-- Select a Unit --</option>
                  {unitsForSelectedCourse.map(unit => (
                    <option key={unit._id} value={unit._id}>{unit.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedUnitId ? (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Assignments for {unitsForSelectedCourse.find(u => u._id === selectedUnitId)?.name}
                </h2>
                <button onClick={() => openModal()} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 shadow-sm">
                  <FaPlus />
                </button>
              </div>
              <AssignmentsList
                  unitId={selectedUnitId}
                  isTeacher={true}
                  onEdit={openModal}
                  onDelete={handleDeleteAssignment}
              />
            </div>
          ) : (
            <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed">
              <p className="text-gray-500 font-medium">Please select a course and unit to view assignments.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed  overflow-y-auto inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
            <h2 className="text-xl font-bold mb-4">{editingAssignment ? 'Edit Assignment' : 'Create Assignment'}</h2>
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