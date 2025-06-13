'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TeacherSchedule from '@/components/teacher/TeacherSchedule';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TeacherSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    } else if (session.user.role !== 'teacher') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session || session.user.role !== 'teacher') {
    return null;
  }

  return (
    <div className="w-full overflow-x-hidden">
      <TeacherSchedule />
    </div>
  );
}
