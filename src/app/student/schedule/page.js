'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import StudentSchedule from '@/components/student/StudentSchedule';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function StudentSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    } else if (session.user.role !== 'student') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session || session.user.role !== 'student') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <StudentSchedule />
    </div>
  );
}
