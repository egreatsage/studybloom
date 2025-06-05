'use client';

import { useEffect, useState } from 'react';
import TeacherCoursesTable from '@/components/TeacherCoursesTable';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/teaching-assignments');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        // Extract courses from teaching assignments
        const teacherCourses = data.map(assignment => assignment.course);
        setCourses(teacherCourses);
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
      <TeacherCoursesTable courses={courses} />
    </div>
  );
}
