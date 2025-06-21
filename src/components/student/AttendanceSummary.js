'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

const AttendanceSummary = () => {
  const { data: session } = useSession();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      if (!session) return;
      try {
        setLoading(true);
        // This endpoint will need to be created to aggregate attendance data
        const response = await fetch('/api/students/attendance-summary');
        if (!response.ok) {
          throw new Error('Failed to fetch attendance summary');
        }
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceSummary();
  }, [session]);

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) return <LoadingSpinner />;
  if (!summary) return <p>Could not load attendance summary.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      < div className='flex justify-between items-center mb-4'>
      <h1>Attendance Summary</h1>
      <Link className='border border-gray-300 px-2 py-2 rounded-md hover:bg-indigo-100' href="/student/attendance">
      View full Attendance
      </Link>
      </div>
      <div className="space-y-4">
        {/* Overall Summary */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold">Overall Attendance</h3>
            <span className="font-bold text-lg">{summary.overallPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getProgressBarColor(summary.overallPercentage)}`}
              style={{ width: `${summary.overallPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{summary.totalPresent} out of {summary.totalInstances} classes attended</p>
        </div>

        <hr/>

        {/* Per Unit Summary */}
        <div className="space-y-3">
            <h3 className="font-semibold">Breakdown by Unit</h3>
            {summary.byUnit.map(unitSummary => (
                <div key={unitSummary.unit._id}>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium">{unitSummary.unit.code} - {unitSummary.unit.name}</p>
                        <span className="text-sm font-semibold">{unitSummary.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                        className={`h-2 rounded-full ${getProgressBarColor(unitSummary.percentage)}`}
                        style={{ width: `${unitSummary.percentage}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary;