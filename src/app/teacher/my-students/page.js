'use client';

import { useState, useEffect } from 'react';
import MyStudentsTable from '@/components/teacher/MyStudentsTable';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MyStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/teachers/my-students');
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Students</h1>
      <MyStudentsTable students={students} />
    </div>
  );
}