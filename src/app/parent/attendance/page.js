'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaCalendarCheck, FaExclamationCircle } from 'react-icons/fa';
import AttendanceStats from '@/components/student/AttendanceStats';
import AttendanceChart from '@/components/student/AttendanceChart';
import AttendanceTable from '@/components/student/AttendanceTable';
import { useSession } from 'next-auth/react';

export default function ParentAttendancePage() {
    const { data: session } = useSession();
    const [summaryData, setSummaryData] = useState([]);
    const [logData, setLogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch both summary and detailed records in parallel
                const [summaryRes, logRes] = await Promise.all([
                    fetch('/api/parent/attendance-summary'),
                    fetch('/api/parent/attendance')
                ]);

                if (!summaryRes.ok) throw new Error('Failed to fetch attendance summary');
                if (!logRes.ok) throw new Error('Failed to fetch attendance log');

                const summary = await summaryRes.json();
                const logs = await logRes.json();
                
                setSummaryData(summary);
                // We need to flatten the log data for the table component
                const flattenedLogs = logs.flatMap(child => child.records);
                setLogData(flattenedLogs);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    
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
        <div className="container mx-auto px-4 py-8 space-y-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Children's Attendance</h1>
            
            {summaryData.length === 0 && (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No children linked to your account.</p>
                </div>
            )}

            {summaryData.map(childData => (
                <div key={childData.childId} className="space-y-8 p-6 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-3xl font-semibold mb-6 flex items-center border-b pb-4">
                        <FaCalendarCheck className="mr-3 text-blue-600" />
                        {childData.childName}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <AttendanceStats summary={childData} />
                        </div>
                        <div>
                            <AttendanceChart summary={childData} />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Attendance by Unit</h3>
                        <div className="space-y-4">
                            {childData.byUnit.map((unitSummary) => (
                                <div key={unitSummary.unit._id} className="border-b border-gray-100 pb-4 last:border-0">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                    <h4 className="font-medium">{unitSummary.unit.code} - {unitSummary.unit.name}</h4>
                                    </div>
                                    <span className="font-semibold">{unitSummary.percentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                    className={`h-2.5 rounded-full ${
                                        unitSummary.percentage >= 90 ? 'bg-green-500' : 
                                        unitSummary.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
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
                </div>
            ))}
            {session?.user?.role !== 'parent' && logData.length > 0 && (
                 <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Complete Attendance Log</h2>
                    {/* The table component needs to be adjusted to handle records from multiple children if necessary */}
                    <AttendanceTable records={logData} />
                 </div>
            )}
        </div>
    );
}