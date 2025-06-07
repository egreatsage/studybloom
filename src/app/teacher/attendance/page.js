'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AttendanceDetailsTable from '@/components/teacher/AttendanceDetailsTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import AttendanceReport from '@/components/teacher/AttendanceReport';
import { FaPrint } from 'react-icons/fa';

export default function TeacherAttendancePage() {
  const { data: session } = useSession();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States moved from TeacherSchedule
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportDateRange, setReportDateRange] = useState({ start: '', end: '' });
  const [generatingReport, setGeneratingReport] = useState(false);

  // Function moved from TeacherSchedule
  const handleGenerateReport = async () => {
    if (!reportDateRange.start || !reportDateRange.end) {
        alert("Please select a start and end date for the report.");
        return;
    }
    setGeneratingReport(true);
    try {
        const response = await fetch(`/api/teachers/attendance-report?startDate=${reportDateRange.start}&endDate=${reportDateRange.end}`);
        if (!response.ok) {
            throw new Error('Failed to generate report');
        }
        const data = await response.json();
        setReportData(data.reportData);
        setShowReport(true);
    } catch (error) {
        console.error(error.message);
    } finally {
        setGeneratingReport(false);
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
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
      {showReport && (
        <AttendanceReport
            reportData={reportData}
            teacherName={session.user.name}
            dateRange={reportDateRange}
            onClose={() => setShowReport(false)}
        />
      )}

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Records</h1>

      {/* Report Generation UI */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Generate Attendance Report</h3>
        <div className="flex flex-wrap items-end gap-4">
            <div>
                <label htmlFor="report-start" className="text-sm text-gray-600 block">Start Date</label>
                <input type="date" id="report-start" className="px-3 py-1 border rounded" value={reportDateRange.start} onChange={e => setReportDateRange(prev => ({...prev, start: e.target.value}))}/>
            </div>
            <div>
                <label htmlFor="report-end" className="text-sm text-gray-600 block">End Date</label>
                <input type="date" id="report-end" className="px-3 py-1 border rounded" value={reportDateRange.end} onChange={e => setReportDateRange(prev => ({...prev, end: e.target.value}))}/>
            </div>
            <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400"
            >
                {generatingReport ? <LoadingSpinner size="sm"/> : <FaPrint />}
                {generatingReport ? 'Generating...' : 'Generate Report'}
            </button>
        </div>
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <AttendanceDetailsTable attendanceRecords={attendanceRecords} />
      )}
    </div>
  );
}