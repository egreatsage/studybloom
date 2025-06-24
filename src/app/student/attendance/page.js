'use client';

import { useEffect, useState, useMemo } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaExclamationCircle } from 'react-icons/fa';
import AttendanceStats from '@/components/student/AttendanceStats';
import AttendanceChart from '@/components/student/AttendanceChart';
import AttendanceTable from '@/components/student/AttendanceTable';

export default function StudentAttendancePage() {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both summary and detailed records
        const [summaryResponse, recordsResponse] = await Promise.all([
          fetch('/api/students/attendance-summary'),
          fetch('/api/students/attendance')
        ]);

        if (!summaryResponse.ok || !recordsResponse.ok) {
          throw new Error('Failed to fetch attendance data');
        }

        const [summaryData, recordsData] = await Promise.all([
          summaryResponse.json(),
          recordsResponse.json()
        ]);

        // Calculate stats from detailed records for AttendanceStats
        const stats = recordsData.reduce((acc, record) => {
          acc[record.status] = (acc[record.status] || 0) + 1;
          return acc;
        }, {});

        // Combine summary data with detailed stats
        const combinedSummary = {
          ...summaryData,
          present: stats.present || 0,
          absent: stats.absent || 0,
          late: stats.late || 0,
          excused: stats.excused || 0,
          total: (stats.present || 0) + (stats.absent || 0) + (stats.late || 0) + (stats.excused || 0)
        };

        setSummary(combinedSummary);
        setRecords(recordsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  if (!summary) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No attendance data available.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">My Attendance</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <AttendanceStats summary={summary} />
        </div>
        <div>
          <AttendanceChart summary={summary} />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Attendance by Unit</h2>
        <div className="space-y-4">
          {summary.byUnit.map((unitSummary) => (
            <div key={unitSummary.unit._id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium">{unitSummary.unit.code}</h3>
                  <p className="text-sm text-gray-600">{unitSummary.unit.name}</p>
                </div>
                <span className="font-semibold">{unitSummary.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    unitSummary.percentage >= 90 
                      ? 'bg-green-500' 
                      : unitSummary.percentage >= 75 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${unitSummary.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {unitSummary.present} out of {unitSummary.total} classes attended
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <AttendanceTable records={records} />
      </div>
    </div>
  );
}
