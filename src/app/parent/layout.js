'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ParentSidebar from '@/components/parent/ParentSidebar'; // We will create this next

export default function ParentLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect if the user is not a parent
      if (session?.user?.role !== 'parent') {
        router.push('/');
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  if (status === 'loading' || !session) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;
  }

  // Prevent rendering the layout for non-parent roles while redirecting
  if (session?.user?.role !== 'parent') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ParentSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}