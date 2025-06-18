'use client';

import { useEffect, useState, useMemo } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaExclamationCircle } from 'react-icons/fa';
import AttendanceStats from '@/components/student/AttendanceStats';
import AttendanceChart from '@/components/student/AttendanceChart';
import AttendanceTable from '@/components/student/AttendanceTable';

export default function StudentAttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/students/attendance');
        if (!response.ok) {
          throw new Error('Failed to fetch attendance records');
        }
        const data = await response.json();
        setRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const attendanceSummary = useMemo(() => {
    if (records.length === 0) {
      return { present: 0, absent: 0, late: 0, excused: 0, total: 0, overallPercentage: 100 };
    }
    
    const stats = { present: 0, absent: 0, late: 0, excused: 0 };
    records.forEach(record => {
      stats[record.status] = (stats[record.status] || 0) + 1;
    });
    
    const total = records.length;
    const attended = stats.present + stats.late;
    const overallPercentage = total > 0 ? (attended / total) * 100 : 100;
    
    return { ...stats, total, overallPercentage };
  }, [records]);

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
    <div className="container max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">My Attendance</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <AttendanceStats summary={attendanceSummary} />
        </div>
        <div>
          <AttendanceChart summary={attendanceSummary} />
        </div>
      </div>
      
      <div>
        <AttendanceTable records={records} />
      </div>
    </div>
  );
}
