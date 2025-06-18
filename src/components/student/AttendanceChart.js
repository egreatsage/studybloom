import { FaChartPie } from 'react-icons/fa';

export default function AttendanceChart({ summary }) {
  const total = summary.total;
  
  if (total === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col items-center justify-center text-center">
        <FaChartPie className="text-gray-300 text-5xl mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">Attendance Distribution</h3>
        <p className="text-gray-500 mt-2">No attendance data available yet to display the chart.</p>
      </div>
    );
  }

  const data = [
    { label: 'Present', value: summary.present, color: '#10B981' },
    { label: 'Absent', value: summary.absent, color: '#EF4444' },
    { label: 'Late', value: summary.late, color: '#F59E0B' },
    { label: 'Excused', value: summary.excused, color: '#3B82F6' },
  ];

  let cumulativePercent = 0;
  const segments = data.map(item => {
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    const segment = { ...item, percent, offset: cumulativePercent };
    cumulativePercent += percent;
    return segment;
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Distribution</h3>
      <div className="flex justify-center mb-6">
        <svg viewBox="0 0 36 36" className="w-full max-w-xs h-auto max-h-40">
          {segments.map(segment => (
            <circle
              key={segment.label}
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke={segment.color}
              strokeWidth="3.8"
              strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
              strokeDashoffset={-segment.offset}
              transform="rotate(-90 18 18)"
            />
          ))}
        </svg>
      </div>
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.label} className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
              <span>{item.label}</span>
            </div>
            <span className="font-medium">{item.value} ({total > 0 ? (item.value/total * 100).toFixed(0) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}