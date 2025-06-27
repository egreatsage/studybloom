import { useState, useMemo } from 'react';
import { FaFilter } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

export default function AttendanceTable({ records }) {
  
  const [filter, setFilter] = useState('all');

  const filteredRecords = useMemo(() => {
    if (filter === 'all') {
      return records;
    }
    return records.filter(record => record.status === filter);
  }, [records, filter]);
  
  const getStatusBadge = (status) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      excused: 'bg-blue-100 text-blue-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Detailed Log</h3>
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-400" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
        </div>
      </div>
      
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map(record => (
                <tr key={record._id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{record.unit?.name ?? 'N/A'} ({record.unit?.code ?? 'N/A'})</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-8 text-gray-500">
                    No records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      
    </div>
  );
}
