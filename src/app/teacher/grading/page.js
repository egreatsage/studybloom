'use client';

import { useState, useEffect, useMemo } from 'react';
import useTeachingStore from '@/lib/stores/teachingStore';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import { useSession } from 'next-auth/react';
import { confirmDialog } from '@/lib/utils/confirmDialog';
import { FaPlus, FaBookOpen, FaClipboardList, FaChalkboardTeacher, FaChevronRight, FaEdit, FaTrash, FaChevronDown, FaGraduationCap, FaTasks, FaUsers, FaClock } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import AssignmentForm from '@/components/AssignmentForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import AssignmentSubmissions from '@/components/teacher/AssignmentSubmissions';

export default function GradingCenterPage() {
  const { data: session } = useSession();
  const { assignments: teachingAssignments, fetchTeacherCourses, loading: teachingLoading } = useTeachingStore();
  const { createAssignment, fetchAssignments, assignments, updateAssignment, deleteAssignment, loading: assignmentLoading } = useAssignmentStore();

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 font-medium">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaChalkboardTeacher className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Assignment Center</h1>
                <p className="text-gray-600 mt-1">Manage assignments and grade student submissions</p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="hidden lg:flex space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white min-w-[120px] text-center">
                <FaGraduationCap className="text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold">{uniqueCourses.length}</p>
                <p className="text-sm opacity-90">Courses</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white min-w-[120px] text-center">
                <FaTasks className="text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-sm opacity-90">Assignments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white w-full mx-auto px-1 md:px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Course and Unit Selection */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-8">
              <div className="space-y-6">
                {/* Course Selection */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <FaBookOpen className="text-white text-sm" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Select Course</h2>
                  </div>
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

                {/* Unit Selection */}
                {selectedCourseId && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <FaClipboardList className="text-white text-sm" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-800">Select Unit</h2>
                    </div>
                    <select 
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white disabled:opacity-50"
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      value={selectedUnitId}
                      disabled={unitsForSelectedCourse.length === 0}
                    >
                      <option value="">Choose a unit...</option>
                      {unitsForSelectedCourse.map(unit => (
                        <option key={unit._id} value={unit._id}>{unit.code} - {unit.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Assignments */}
          <div className="lg:w-3/4">
            {selectedUnitId ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-2 py-5 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {unitsForSelectedCourse.find(u => u._id === selectedUnitId)?.name}
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

                {/* Assignments List */}
                <div className=" px-1 py-3 sm:p-4 md:p-6">
                  {assignmentLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTasks className="text-3xl text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments yet</h3>
                      <p className="text-gray-600 mb-6">Create your first assignment to get started</p>
                      <button 
                        onClick={() => openModal()} 
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                      >
                        <FaPlus className="mr-2" />
                        Create Assignment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assignments.map(assignment => (
                        <div key={assignment._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
                          {/* Assignment Header */}
                          <div 
                            className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => handleToggleSubmissions(assignment._id)}
                          >
                            <div className="flex-1 min-w-0 pr-4">
                              <h3 className="font-semibold text-gray-900 text-lg truncate">{assignment.title}</h3>
                              <div className="flex  items-center space-x-4 mt-2 text-sm text-gray-600 truncate">
                                <span className="flex mt-3 items-center">
                                  <FaUsers className="mr-1" />
                                  {assignment.submissions?.length || 0} submissions
                                </span>
                                <span className="flex items-center mt-3">
                                  <FaClock className="mr-1" />
                                  Due: {assignment.dueDate ? format(parseISO(assignment.dueDate), 'MMM d, yyyy') : 'No due date'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openModal(assignment); }} 
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <FaEdit className="text-lg" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteAssignment(assignment._id); }} 
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FaTrash className="text-lg" />
                              </button>
                              <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${expandedAssignmentId === assignment._id ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {/* Submissions Panel */}
                          {expandedAssignmentId === assignment._id && (
                            <div className="border-t border-gray-200 bg-gray-50">
                              <AssignmentSubmissions assignment={assignment} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaChevronRight className="text-4xl text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Course & Unit</h3>
                <p className="text-gray-600 text-lg">Choose a course and unit from the sidebar to view and manage assignments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
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