import { FaCheckCircle, FaTimesCircle, FaClock, FaInfoCircle, FaPercentage } from 'react-icons/fa';

const StatCard = ({ icon, label, value, color }) => {
  const Icon = icon;
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${color}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Icon className="text-white text-xl" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">{label}</p>
            <p className="text-white text-3xl font-bold">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AttendanceStats({ summary }) {
  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 font-medium">Overall Attendance Rate</p>
              <p className="text-5xl font-bold text-blue-600">{summary.overallPercentage.toFixed(1)}%</p>
            </div>
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
              <FaPercentage className="text-blue-500 text-4xl" />
            </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <StatCard 
          icon={FaCheckCircle} 
          label="Attended" 
          value={summary.present + summary.late} 
          color="from-green-500 to-emerald-500"
        />
        <StatCard 
          icon={FaTimesCircle} 
          label="Absent" 
          value={summary.absent} 
          color="from-red-500 to-pink-500"
        />
        <StatCard 
          icon={FaClock} 
          label="Late" 
          value={summary.late} 
          color="from-yellow-500 to-orange-500"
        />
        <StatCard 
          icon={FaInfoCircle} 
          label="Excused" 
          value={summary.excused} 
          color="from-blue-500 to-indigo-500"
        />
      </div>
    </div>
  );
}