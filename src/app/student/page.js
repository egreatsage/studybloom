'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useEnrollmentStore from '@/lib/stores/enrollmentStore';
import StudentCoursesTable from '@/components/StudentCoursesTable';
import UnitsList from '@/components/UnitsList';
import AssignmentsList from '@/components/AssignmentsList';
import LoadingSpinner from '@/components/LoadingSpinner';

const StudentDashboard = () => {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const { courses, loading, error, fetchEnrolledCourses } = useEnrollmentStore();

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Enrolled Courses Section */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">My Courses</h2>
            <StudentCoursesTable
              courses={courses}
              onCourseSelect={setSelectedCourse}
              selectedCourseId={selectedCourse?._id}
            />
          </div>
        </div>

        {/* Course Units Section */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Course Units</h2>
            {selectedCourse ? (
              <UnitsList
                courseId={selectedCourse._id}
                onUnitSelect={setSelectedUnit}
                selectedUnitId={selectedUnit?._id}
                isTeacher={false}
              />
            ) : (
              <p className="text-gray-500">Select a course to view its units</p>
            )}
          </div>
        </div>

        {/* Unit Assignments Section */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Unit Assignments</h2>
            {selectedUnit ? (
              <AssignmentsList
                unitId={selectedUnit._id}
                isTeacher={false}
              />
            ) : (
              <p className="text-gray-500">Select a unit to view its assignments</p>
            )}
          </div>
        </div>
      </div>

      {/* Course Progress Section */}
      {selectedCourse && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Course Progress</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-700">Completed Assignments</h3>
                <p className="text-3xl font-bold text-blue-900">
                  {selectedCourse.completedAssignments || 0}/{selectedCourse.totalAssignments || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-700">Average Grade</h3>
                <p className="text-3xl font-bold text-green-900">
                  {selectedCourse.averageGrade?.toFixed(1) || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Upcoming Assignments</h2>
            <div className="space-y-4">
              {selectedCourse.upcomingAssignments?.length > 0 ? (
                selectedCourse.upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{assignment.title}</h3>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-blue-600">
                      {assignment.unit.name}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No upcoming assignments</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
