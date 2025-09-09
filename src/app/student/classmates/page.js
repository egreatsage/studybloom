'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ClassmatesList from '@/components/student/ClassmatesList';
import { FaUsers, FaExclamationCircle } from 'react-icons/fa';

export default function MyClassmatesPage() {
  const [classmates, setClassmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClassmates = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/students/my-classmates');
        if (!response.ok) {
          throw new Error('Failed to fetch classmates');
        }
        const data = await response.json();
        setClassmates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassmates();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <FaExclamationCircle className="mx-auto text-red-500 text-3xl mb-4" />
        <h2 className="text-xl font-bold text-red-800">Failed to load data</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
          <FaUsers className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Classmates</h1>
          <p className="text-gray-500">Students in your registered units this semester.</p>
        </div>
      </div>

      <ClassmatesList classmates={classmates} />
    </div>
  );
}