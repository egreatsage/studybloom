'use client';

import { FaDownload, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import { usePDF } from 'react-to-pdf';

const AttendanceReport = ({ reportData, teacherName, dateRange, onClose }) => {
  const { toPDF, targetRef } = usePDF({ 
    filename: `attendance-report-${dateRange.start}-to-${dateRange.end}.pdf`,
    page: {
      margin: 20,
      format: 'a4',
      orientation: 'portrait',
    }
  });

  if (!reportData) {
    return <LoadingSpinner />;
  }

  const statusColors = {
    present: '#16a34a', // green-600 equivalent
    absent: '#dc2626',  // red-600 equivalent
    late: '#ca8a04',   // yellow-600 equivalent
    excused: '#3b82f6' // blue-500 equivalent
  };

  const handleDownload = async () => {
    try {
       toPDF();
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback: try window.print()
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 md:p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            {/* Header with Controls */}
            <div className="flex-shrink-0 p-4 bg-gray-50 border-b rounded-t-lg flex justify-between items-center">
                <h2 className="text-xl font-bold">Attendance Report Preview</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleDownload} 
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                        style={{ backgroundColor: '#2563eb' }} // bg-blue-600 equivalent
                    >
                        <FaDownload /> Download PDF
                    </button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200">
                        <FaTimes size={20} />
                    </button>
                </div>
            </div>

            {/* Scrollable Report Content */}
            <div className="flex-grow overflow-y-auto md:p-8 px-1 py-8">
                <div ref={targetRef} style={{ fontFamily: 'Arial, sans-serif' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>
                            Attendance Report
                        </h1>
                        <p style={{ color: '#6b7280', margin: '4px 0' }}>Teacher: {teacherName}</p>
                        <p style={{ color: '#6b7280', margin: '4px 0' }}>
                            Period: {dateRange.start} to {dateRange.end}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {Object.keys(reportData).length === 0 ? (
                        <p>No completed lecture data for this period.</p>
                    ) : (
                        Object.entries(reportData).map(([date, instances]) => (
                        <div key={date}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                backgroundColor: '#f3f4f6',
                                padding: '8px',
                                borderRadius: '8px 8px 0 0',
                                borderBottom: '2px solid #d1d5db',
                                margin: '0'
                            }}>
                            {new Date(date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                            </h2>
                            <div style={{
                                padding: '16px',
                                border: '1px solid #d1d5db',
                                borderTop: 'none',
                                borderRadius: '0 0 8px 8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}>
                            {instances.map(instance => (
                                <div key={instance._id}>
                                <h3 style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>
                                    {instance.lecture.unit.code} - {instance.lecture.unit.name}
                                </h3>
                                <p style={{ 
                                    fontSize: '14px', 
                                    color: '#6b7280', 
                                    margin: '0 0 8px 0' 
                                }}>
                                    {instance.lecture.startTime} - {instance.lecture.endTime}
                                </p>
                                <div style={{
                                    overflowX: 'auto',
                                    width: '100%',
                                    WebkitOverflowScrolling: 'touch',
                                    msOverflowStyle: '-ms-autohiding-scrollbar'
                                }}>
                                    <table style={{ 
                                        width: '100%', 
                                        fontSize: '14px',
                                        borderCollapse: 'collapse',
                                        marginTop: '8px',
                                        minWidth: '500px' // Ensures table won't shrink too much on mobile
                                    }}>
                                    <thead>
                                    <tr style={{ backgroundColor: '#f9fafb' }}>
                                        <th style={{ 
                                            padding: '4px 8px', 
                                            textAlign: 'left',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            Student Name
                                        </th>
                                         <th style={{ 
                                            padding: '4px 8px', 
                                            textAlign: 'left',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            Reg Number
                                        </th>
                                         <th style={{ 
                                            padding: '4px 8px', 
                                            textAlign: 'left',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            Phone Number
                                        </th>
                                          <th style={{ 
                                            padding: '4px 8px', 
                                            textAlign: 'left',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            Email
                                        </th>
                                        <th style={{ 
                                            padding: '4px 8px', 
                                            textAlign: 'left',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            Status
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {instance.attendance.map(att => (
                                        <tr key={att.student._id}>
                                        <td style={{ 
                                            padding: '4px 8px',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                         {att.student.name}
                                        </td>
                                        <td style={{ 
                                            padding: '4px 8px',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            {att.student.regNumber} 
                                        </td>
                                          <td style={{ 
                                            padding: '4px 8px',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            {att.student.phoneNumber} 
                                        </td>
                                          <td style={{ 
                                            padding: '4px 8px',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            {att.student.email} 
                                        </td>
                                        <td style={{ 
                                            padding: '4px 8px',
                                            fontWeight: '500',
                                            color: statusColors[att.status],
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                                        </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    </table>
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        ))
                    )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AttendanceReport;