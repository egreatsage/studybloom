'use client';

import { useEffect, useState } from 'react';
import useAssignmentStore from '@/lib/stores/assignmentStore';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StudentAssignmentItem from '@/components/student/StudentAssignmentItem';

export default function StudentAssignmentsPage() {
  const { data: session } = useSession();
  const { assignments, fetchAssignments, submitAssignment, loading: assignmentsLoading } = useAssignmentStore();

  // This simple useEffect fetches all relevant assignments for the logged-in student.
  useEffect(() => {
    if (session?.user?.id) {
      // We call fetchAssignments() with NO arguments.
      // The API now knows how to handle this for a student.
      fetchAssignments();
    }
  }, [session, fetchAssignments]);

  const handleSubmission = async (formData) => {
    const assignmentId = formData.get('assignmentId');
    await submitAssignment(assignmentId, formData);
  };
  
  // We can get the course name from the first assignment in the list.
  const courseName = assignments.length > 0 ? assignments[0].course.name : 'your course';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Assignments</h1>
      <h2 className="text-xl text-gray-600 mb-6">For {courseName}</h2>
      
      {/* The course filter dropdown is removed as it's no longer needed. */}

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
          // The assignments are already filtered by the API, so we can map them directly.
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