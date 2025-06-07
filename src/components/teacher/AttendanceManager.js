'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  X, 
  Search, 
  Users, 
  Calendar,
  Filter,
  MoreHorizontal,
  Save,
  RotateCcw,
  UserCheck,
  UserX
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const AttendanceManager = ({ lecture, lectureInstance, onClose }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/lectures/${lecture._id}/students`);
        if (!response.ok) {
          throw new Error('Failed to fetch student list');
        }
        const studentData = await response.json();
        setStudents(studentData);

        const initialAttendance = {};
        const existingRecords = lectureInstance.attendance || [];

        studentData.forEach(student => {
          const record = existingRecords.find(a => a.student === student._id);
          initialAttendance[student._id] = record ? record.status : 'present';
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
    filteredStudents.forEach(student => {
      newAttendance[student._id] = status;
    });
    setAttendance(prev => ({ ...prev, ...newAttendance }));
    toast.success(`Marked ${filteredStudents.length} students as ${status}`);
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
    { 
      value: 'present', 
      label: 'Present', 
      icon: CheckCircle2, 
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100',
      activeColor: 'ring-emerald-300 bg-emerald-100'
    },
    { 
      value: 'absent', 
      label: 'Absent', 
      icon: XCircle, 
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      activeColor: 'ring-red-300 bg-red-100'
    },
    { 
      value: 'late', 
      label: 'Late', 
      icon: Clock, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      hoverColor: 'hover:bg-amber-100',
      activeColor: 'ring-amber-300 bg-amber-100'
    },
    { 
      value: 'excused', 
      label: 'Excused', 
      icon: AlertCircle, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      activeColor: 'ring-blue-300 bg-blue-100'
    },
  ];

  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(student => attendance[student._id] === filterStatus);
    }

    return filtered;
  }, [students, searchTerm, filterStatus, attendance]);

  const attendanceStats = useMemo(() => {
    const stats = { present: 0, absent: 0, late: 0, excused: 0 };
    Object.values(attendance).forEach(status => {
      stats[status] = (stats[status] || 0) + 1;
    });
    return stats;
  }, [attendance]);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Attendance Manager</h2>
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{new Date(lectureInstance.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{students.length} Students</span>
                </div>
              </div>
              <p className="text-sm text-blue-100 mt-1">{lecture.unit.name}</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {attendanceOptions.map(option => {
              const Icon = option.icon;
              const count = attendanceStats[option.value] || 0;
              return (
                <div key={option.value} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${option.bgColor}`}>
                    <Icon className={`w-4 h-4 ${option.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500">{option.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-white border-b space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-48">
                  <div className="p-2">
                    <button
                      onClick={() => {setFilterStatus('all'); setIsFilterOpen(false);}}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterStatus === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      All Students
                    </button>
                    {attendanceOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {setFilterStatus(option.value); setIsFilterOpen(false);}}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                          filterStatus === option.value ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                        }`}
                      >
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleMarkAll('present')} 
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-medium"
            >
              <UserCheck className="w-4 h-4" />
              <span>Mark All Present</span>
            </button>
            <button 
              onClick={() => handleMarkAll('absent')} 
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <UserX className="w-4 h-4" />
              <span>Mark All Absent</span>
            </button>
            <button 
              onClick={() => handleMarkAll('late')} 
              className="flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors text-sm font-medium"
            >
              <Clock className="w-4 h-4" />
              <span>Mark All Late</span>
            </button>
          </div>

          {filteredStudents.length !== students.length && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          )}
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Users className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No students found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredStudents.map((student, index) => {
                const currentStatus = attendance[student._id];
                const currentOption = attendanceOptions.find(opt => opt.value === currentStatus);
                
                return (
                  <div key={student._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      {/* Student Info */}
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {student.photoUrl ? (
                            <img 
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200" 
                              src={student.photoUrl} 
                              alt={student.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(student.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                          <p className="text-sm text-gray-500 truncate">{student.email}</p>
                        </div>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        {attendanceOptions.map(option => {
                          const Icon = option.icon;
                          const isActive = currentStatus === option.value;
                          
                          return (
                            <button
                              key={option.value}
                              onClick={() => handleStatusChange(student._id, option.value)}
                              className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                                isActive 
                                  ? `${option.activeColor} ring-2 shadow-sm` 
                                  : `${option.bgColor} ${option.hoverColor} hover:shadow-sm`
                              }`}
                              title={option.label}
                            >
                              <Icon className={`w-5 h-5 ${option.color}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            {filteredStudents.length} students • {Object.keys(attendance).length} marked
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManager;