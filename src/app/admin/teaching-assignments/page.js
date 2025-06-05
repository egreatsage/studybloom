'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import TeachingAssignmentManager from '@/components/admin/TeachingAssignmentManager';

export default function TeachingAssignmentsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  if (loading || status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teaching Assignments</h1>
        <p className="text-gray-600 mt-2">
          Manage teacher assignments to courses and units
        </p>
      </div>
      
      <TeachingAssignmentManager />
    </div>
  );
}
