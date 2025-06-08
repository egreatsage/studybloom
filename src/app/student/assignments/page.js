'use client';

import { useEffect, useState } from 'react';
import useEnrollmentStore from '@/lib/stores/enrollmentStore';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import AssignmentsList from '@/components/AssignmentsList';

export default function StudentAssignmentsPage() {
  const { courses, fetchEnrolledCourses } = useEnrollmentStore();
  const { assignments, fetchAssignments } = useAssignmentStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchEnrolledCourses();
      // Fetch all assignments for the student based on their enrollments
      await fetchAssignments(); 
      setLoading(false);
    };
    loadData();
  }, [fetchEnrolledCourses, fetchAssignments]);

  const assignmentsByCourse = courses.map(course => ({
    ...course,
    assignments: assignments.filter(assignment => assignment.course === course._id)
  })).filter(course => course.assignments.length > 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Assignments</h1>
      
      {assignmentsByCourse.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p>You have no assignments at the moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {assignmentsByCourse.map(course => (
            <div key={course._id} className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">{course.name} ({course.code})</h2>
              <AssignmentsList assignments={course.assignments} isTeacher={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}