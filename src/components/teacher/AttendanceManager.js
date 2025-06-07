'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaMinusCircle, FaQuestionCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const AttendanceManager = ({ lecture, lectureInstance, onClose }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Fetch the list of students enrolled in the unit
        const response = await fetch(`/api/lectures/${lecture._id}/students`);
        if (!response.ok) {
          throw new Error('Failed to fetch student list');
        }
        const studentData = await response.json();
        setStudents(studentData);

        // Initialize attendance state
        const initialAttendance = {};
        const existingRecords = lectureInstance.attendance || [];

        studentData.forEach(student => {
          const record = existingRecords.find(a => a.student === student._id);
          initialAttendance[student._id] = record ? record.status : 'present'; // Default to 'present'
        });
        setAttendance(initialAttendance);

      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [lecture._id, lectureInstance]);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      
      const response = await fetch(`/api/lecture-instances/${lectureInstance._id}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendances: attendanceData }),
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }

      toast.success('Attendance saved successfully!');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };
  
  const attendanceOptions = [
    { value: 'present', label: 'Present', icon: <FaCheckCircle className="text-green-500" /> },
    { value: 'absent', label: 'Absent', icon: <FaTimesCircle className="text-red-500" /> },
    { value: 'late', label: 'Late', icon: <FaMinusCircle className="text-yellow-500" /> },
    { value: 'excused', label: 'Excused', icon: <FaQuestionCircle className="text-blue-500" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Manage Attendance</h2>
            <p className="text-sm text-gray-600">{lecture.unit.name} - {new Date(lectureInstance.date).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex justify-start gap-2 mb-4">
                <button onClick={() => handleMarkAll('present')} className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded">Mark All Present</button>
                <button onClick={() => handleMarkAll('absent')} className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded">Mark All Absent</button>
            </div>
            <div className="flex-grow overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-8 w-8 rounded-full" src={student.photoUrl || '/default-profile.png'} alt="" />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                           {attendanceOptions.map(opt => (
                               <button 
                                 key={opt.value}
                                 onClick={() => handleStatusChange(student._id, opt.value)}
                                 className={`p-2 rounded-full transition-transform transform hover:scale-110 ${attendance[student._id] === opt.value ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-300'}`}
                                 title={opt.label}
                               >
                                 {opt.icon}
                               </button>
                           ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2">
                {saving && <FaSpinner className="animate-spin" />}
                Save Attendance
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceManager;