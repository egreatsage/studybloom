'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useTeachingStore from '@/lib/stores/teachingStore';
import TeacherCoursesTable from '@/components/TeacherCoursesTable';
import UnitsList from '@/components/UnitsList';
import AssignmentsList from '@/components/AssignmentsList';
import LoadingSpinner from '@/components/LoadingSpinner';

const TeacherDashboard = () => {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const { courses, loading, error, fetchTeacherCourses } = useTeachingStore();

  useEffect(() => {
    fetchTeacherCourses();
  }, [fetchTeacherCourses]);

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
      <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Courses Section */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">My Courses</h2>
            <TeacherCoursesTable
              courses={courses}
              onCourseSelect={setSelectedCourse}
              selectedCourseId={selectedCourse?._id}
            />
          </div>
        </div>

        {/* Units Section */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Course Units</h2>
            {selectedCourse ? (
              <UnitsList
                courseId={selectedCourse._id}
                onUnitSelect={setSelectedUnit}
                selectedUnitId={selectedUnit?._id}
                isTeacher={true}
              />
            ) : (
              <p className="text-gray-500">Select a course to view its units</p>
            )}
          </div>
        </div>

        {/* Assignments Section */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Unit Assignments</h2>
            {selectedUnit ? (
              <AssignmentsList
                unitId={selectedUnit._id}
                isTeacher={true}
              />
            ) : (
              <p className="text-gray-500">Select a unit to view its assignments</p>
            )}
          </div>
        </div>
      </div>

      {/* Course Management Section */}
      {selectedCourse && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Enrolled Students</h2>
            <CourseStudentsTable courseId={selectedCourse._id} />
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Course Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-700">Total Units</h3>
                <p className="text-3xl font-bold text-blue-900">
                  {selectedCourse.units?.length || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-700">Total Students</h3>
                <p className="text-3xl font-bold text-green-900">
                  {selectedCourse.enrollments?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
