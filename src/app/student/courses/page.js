'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StudentCoursesTable from '@/components/StudentCoursesTable';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/enrollments');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        // Extract courses from enrollments
        const studentCourses = data.map(enrollment => enrollment.course);
        setCourses(studentCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h1>
      <StudentCoursesTable courses={courses} />
    </div>
  );
}
