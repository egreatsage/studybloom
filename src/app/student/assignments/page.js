'use client';

import { useEffect, useState, useCallback } from 'react';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import useEnrollmentStore from '@/lib/stores/enrollmentStore';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StudentAssignmentItem from '@/components/student/StudentAssignmentItem';
import TotalScoreCard from '@/components/student/TotalScoreCard';

export default function StudentAssignmentsPage() {
  const { data: session } = useSession();
  const { assignments, fetchAssignments, submitAssignment, loading: assignmentsLoading } = useAssignmentStore();
  const { courses: enrolledCourses, fetchEnrolledCourses } = useEnrollmentStore();
  const [currentCourseId, setCurrentCourseId] = useState(null);

  const memoizedFetchAssignments = useCallback(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    if (session?.user?.id) {
      memoizedFetchAssignments();
      fetchEnrolledCourses();
    }
  }, [session?.user?.id, memoizedFetchAssignments, fetchEnrolledCourses]);

  // Set current course ID from the first assignment if available
  useEffect(() => {
    if (assignments.length > 0 && assignments[0].course?._id) {
      setCurrentCourseId(assignments[0].course._id);
    }
  }, [assignments]);

  const handleSubmission = async (formData) => {
    const assignmentId = formData.get('assignmentId');
    await submitAssignment(assignmentId, formData);
  };
  
  const courseName = assignments.length > 0 ? assignments[0].course.name : 'your course';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Assignments</h1>
      <h2 className="text-xl text-gray-600 mb-6">For {courseName}</h2>
      
      {/* Display TotalScoreCard if we have a current course */}
      {currentCourseId && (
        <div className="mb-8">
          <TotalScoreCard courseId={currentCourseId} />
        </div>
      )}

      <div className="space-y-4">
        {assignmentsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">You have no assignments at the moment.</p>
          </div>
        ) : (
          assignments.map(assignment => (
            <StudentAssignmentItem 
              key={assignment._id}
              assignment={assignment}
              studentId={session?.user?.id}
              onSubmission={handleSubmission}
            />
          ))
        )}
      </div>
    </div>
  );
}
