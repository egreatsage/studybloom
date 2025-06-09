'use client';

import { useEffect, useState, useMemo } from 'react';
import useEnrollmentStore from '@/lib/stores/enrollmentStore';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StudentAssignmentItem from '@/components/student/StudentAssignmentItem'; // Import the new component

export default function StudentAssignmentsPage() {
  const { data: session } = useSession();
  const { courses, fetchEnrolledCourses, loading: coursesLoading } = useEnrollmentStore();
  const { assignments, fetchAssignments, submitAssignment, loading: assignmentsLoading } = useAssignmentStore();
  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    fetchEnrolledCourses();
    // Fetch all assignments across all student's courses
    if (session?.user?.id) {
        fetchAssignments({}); // Fetch all assignments for the student
    }
  }, [fetchEnrolledCourses, fetchAssignments, session]);

  const assignmentsForSelectedCourse = useMemo(() => {
    if (!selectedCourseId) return [];
    return assignments.filter(assignment => assignment.course === selectedCourseId);
  }, [selectedCourseId, assignments]);

  const handleSubmission = async (formData) => {
    // This function will be passed down to the StudentAssignmentItem -> SubmissionForm
    const assignmentId = formData.get('assignmentId');
    await submitAssignment(assignmentId, formData);
  };
  
  if (coursesLoading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Assignments</h1>
      
      <div className="mb-6">
        <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-2">Filter by Course:</label>
        <select
            id="course-filter"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full max-w-sm p-3 border rounded-lg"
        >
            <option value="">-- Select a Course to View Assignments --</option>
            {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name} ({course.code})</option>
            ))}
        </select>
      </div>

      {selectedCourseId ? (
        <div className="space-y-4">
            {assignmentsLoading ? <LoadingSpinner/> : assignmentsForSelectedCourse.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No assignments for this course.</p>
            ) : (
                assignmentsForSelectedCourse.map(assignment => (
                    <StudentAssignmentItem 
                        key={assignment._id}
                        assignment={assignment}
                        studentId={session?.user?.id}
                        onSubmission={handleSubmission}
                    />
                ))
            )}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">Please select a course to see your assignments.</p>
      )}
    </div>
  );
}