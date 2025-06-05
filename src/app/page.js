'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MdLogin } from "react-icons/md";
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect to dashboard based on role
      switch (session.user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'teacher':
          router.push('/teacher');
          break;
        case 'student':
          router.push('/student');
          break;
        default:
          router.push('/login');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (status === 'authenticated') {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-gray-50">
      <h1 className="text-3xl font-bold">StudyBloom</h1>
      <div className='flex items-center bg-green-800 py-2 cursor-pointer hover:bg-green-900 px-3 rounded-md gap-2  hover:transition-opacity '>
        <MdLogin className='text-white text-3xl font-bold'/>
       <Link
        href="/login"
        className=" text-white text-xl font-bold"
      >
        Sign In
      </Link>
      </div>
     
    </div>
  );
}
