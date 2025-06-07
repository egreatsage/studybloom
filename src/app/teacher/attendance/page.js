'use client';

import { useEffect, useState } from 'react';
import AttendanceDetailsTable from '@/components/teacher/AttendanceDetailsTable';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TeacherAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch('/api/teachers/attendance');
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        const data = await response.json();
        setAttendanceRecords(data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Records</h1>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <AttendanceDetailsTable attendanceRecords={attendanceRecords} />
      )}
    </div>
  );
}