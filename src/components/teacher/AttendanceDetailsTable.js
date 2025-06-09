'use client';

import LoadingSpinner from '../LoadingSpinner';

const AttendanceDetailsTable = ({ attendanceRecords, loading }) => {

  const getStatusBadge = (status) => {
    const colors = {
      present: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm',
      absent: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm',
      late: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm',
      excused: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm',
    };
    return colors[status] || 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm';
  };

  const getStatusIcon = (status) => {
    const icons = {
      present: '✓',
      absent: '✗',
      late: '⏰',
      excused: 'ℹ',
    };
    return icons[status] || '?';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-full"></div>
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Reg. Number</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {attendanceRecords.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <p className="text-gray-500">No records found for the selected filters.</p>
                </td>
              </tr>
            ) : (
              attendanceRecords.map((record) => (
                <tr key={record._id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.student.regNumber || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.student.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.lecture.unit.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                      <span className="mr-1">{getStatusIcon(record.status)}</span>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceDetailsTable;