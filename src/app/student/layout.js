'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StudentSidebar from '@/components/StudentSidebar';

export default function StudentLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'student') {
        router.push('/'); // Redirect non-students to home
      }
    } else if (status === 'unauthenticated') {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [status, session, router]);

  if (status === 'loading' || !session) {
    return <LoadingSpinner />;
  }

  if (session?.user?.role !== 'student') {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StudentSidebar />
      <main className="flex-1 md:p-6">{children}</main>
    </div>
  );
}
