'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaCalendarCheck, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

export default function ParentAttendancePage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/parent/attendance');
                if (!response.ok) throw new Error('Failed to fetch attendance');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'present': return <span className="flex items-center text-green-600"><FaCheckCircle className="mr-1" /> Present</span>;
            case 'absent': return <span className="flex items-center text-red-600"><FaTimesCircle className="mr-1" /> Absent</span>;
            case 'late': return <span className="flex items-center text-yellow-600"><FaClock className="mr-1" /> Late</span>;
            case 'excused': return <span className="flex items-center text-blue-600"><FaCheckCircle className="mr-1" /> Excused</span>;
            default: return status;
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Children's Attendance</h1>
            <div className="space-y-8">
                {data.map(childData => (
                    <div key={childData.childId}>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center"><FaCalendarCheck className="mr-2" />{childData.childName}</h2>
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {childData.records.map((record, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{record.unitName}({record.unitCode})</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusInfo(record.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}