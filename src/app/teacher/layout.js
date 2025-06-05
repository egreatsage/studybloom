'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import TeacherSidebar from '@/components/TeacherSidebar';

export default function TeacherLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'teacher') {
        router.push('/'); // Redirect non-teachers to home
      }
    } else if (status === 'unauthenticated') {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [status, session, router]);

  if (status === 'loading' || !session) {
    return <LoadingSpinner />;
  }

  if (session?.user?.role !== 'teacher') {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TeacherSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
