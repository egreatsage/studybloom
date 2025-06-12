'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaBook, FaCheckCircle, FaHourglassHalf, FaStar } from 'react-icons/fa';

export default function ParentAssignmentsPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/parent/assignments');
                if (!response.ok) throw new Error('Failed to fetch assignments');
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

    const getStatus = (assignment) => {
        if (assignment.submission?.grade != null) {
            return <span className="flex items-center text-green-600"><FaStar className="mr-1" /> Graded: {assignment.submission.grade}%</span>;
        }
        if (assignment.submission) {
            return <span className="flex items-center text-blue-600"><FaCheckCircle className="mr-1" /> Submitted</span>;
        }
        return <span className="flex items-center text-gray-500"><FaHourglassHalf className="mr-1" /> Pending</span>;
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Children's Assignments</h1>
            <div className="space-y-8">
                {data.map(childData => (
                    <div key={childData.childId}>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center"><FaBook className="mr-2" />{childData.childName}</h2>
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {childData.assignments.map(assignment => (
                                        <tr key={assignment._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{assignment.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{assignment.unit.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(assignment.dueDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatus(assignment)}</td>
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