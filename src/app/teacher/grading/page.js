'use client';

import { useState, useEffect, useMemo } from 'react';
import useTeachingStore from '@/lib/stores/teachingStore';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import { useSession } from 'next-auth/react';
import { confirmDialog } from '@/lib/utils/confirmDialog';
import { FaPlus, FaBookOpen, FaClipboardList, FaChalkboardTeacher, FaChevronRight, FaEdit, FaTrash, FaChevronDown } from 'react-icons/fa';
import AssignmentsList from '@/components/AssignmentsList';
import AssignmentForm from '@/components/AssignmentForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import AssignmentSubmissions from '@/components/teacher/AssignmentSubmissions';
// import { formatDate } from '@/lib/utils/errorHandler';


export default function GradingCenterPage() {
  const { data: session } = useSession();
  const { assignments: teachingAssignments, fetchTeacherCourses, loading: teachingLoading } = useTeachingStore();
  const { createAssignment,fetchAssignments,assignments, updateAssignment, deleteAssignment, loading: assignmentLoading } = useAssignmentStore();

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);


   useEffect(() => {
    if (selectedUnitId) {
      fetchAssignments(selectedUnitId);
    }
  }, [selectedUnitId, fetchAssignments]);

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
        if (unitInfo.unit && unitInfo.isActive && !units.has(unitInfo.unit._id)) {
          units.set(unitInfo.unit._id, unitInfo.unit);
        }
      });
    });
    return Array.from(units.values());
  }, [selectedCourseId, teachingAssignments]);

   const handleToggleSubmissions = (assignmentId) => {
    setExpandedAssignmentId(prevId => (prevId === assignmentId ? null : assignmentId));
  };
  const handleSubmitAssignment = async (data) => {
    const assignmentData = {
      ...data,
      courseId: selectedCourseId,
      unitId: selectedUnitId,
    };
    closeModal();
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
      await deleteAssignment(assignmentId, selectedUnitId);
    }
  };

  if (teachingLoading && !uniqueCourses.length) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <FaChalkboardTeacher className="text-3xl text-blue-600" />
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Grading Center</h1>
            <p className="text-gray-500">Manage assignments and grade submissions.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course and Unit Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-6 sticky top-24">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center"><FaBookOpen className="mr-2 text-purple-500"/> 1. Select a Course</h2>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedUnitId('');
                }}
                value={selectedCourseId}
              >
                <option value="">-- Your Courses --</option>
                {uniqueCourses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>
            {selectedCourseId && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center"><FaClipboardList className="mr-2 text-purple-500"/> 2. Select a Unit</h2>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  value={selectedUnitId}
                  disabled={unitsForSelectedCourse.length === 0}
                >
                  <option value="">-- Your Units --</option>
                  {unitsForSelectedCourse.map(unit => (
                    <option key={unit._id} value={unit._id}>{unit.code} - {unit.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assignments Display */}
        <div className="lg:col-span-2">
          {selectedUnitId ? (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Assignments for: <span className="text-purple-600">{unitsForSelectedCourse.find(u => u._id === selectedUnitId)?.name}</span>
                </h2>
                <button onClick={() => openModal()} className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 shadow-lg transform hover:scale-110 transition-transform">
                  <FaPlus />
                </button>
              </div>
           <div className="space-y-4">
                {assignmentLoading ? <LoadingSpinner/> : assignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No assignments created for this unit yet.</p>
                ) : (
                  assignments.map(assignment => (
                    <div key={assignment._id} className="border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50" onClick={() => handleToggleSubmissions(assignment._id)}>
                        <div>
                          <p className="font-semibold text-gray-800">{assignment.title}</p>
                          {/* <p className="text-sm text-gray-500">Due: {formatDate(assignment.dueDate)}</p> */}
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={(e) => { e.stopPropagation(); openModal(assignment); }} className="p-2 text-gray-500 hover:text-blue-600"><FaEdit/></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteAssignment(assignment._id); }} className="p-2 text-gray-500 hover:text-red-600"><FaTrash/></button>
                          <FaChevronDown className={`transition-transform ${expandedAssignmentId === assignment._id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                       {expandedAssignmentId === assignment._id && (
                        <div className="p-4 bg-white">
                          <AssignmentSubmissions assignment={assignment} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-full">
              <FaChevronRight className="text-gray-300 text-6xl mb-4" />
              <p className="text-gray-500 font-medium text-lg">Select a Course and Unit</p>
              <p className="text-gray-400">Choose from the panel on the left to view and manage assignments.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>
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