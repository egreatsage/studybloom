import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const attendanceSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  checkedInAt: {
    type: Date,
    default: null
  }
}, { _id: false });

const materialSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['slides', 'assignment', 'reading', 'video', 'other'],
    default: 'other'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const lectureInstanceSchema = new Schema({
  lecture: { 
    type: Schema.Types.ObjectId, 
    ref: 'Lecture', 
    required: true 
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  actualStartTime: {
    type: Date,
    default: null
  },
  actualEndTime: {
    type: Date,
    default: null
  },
  attendance: [attendanceSchema],
  teacher: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true // Can be different from regular teacher for substitutions
  },
  venue: {
    building: String,
    room: String
    // Venue can be different from regular venue
  },
  notes: {
    type: String,
    default: ''
  },
  cancellationReason: {
    type: String,
    default: null
  },
  materials: [materialSchema]
}, { 
  timestamps: true 
});

// Indexes for efficient queries
lectureInstanceSchema.index({ lecture: 1, date: 1 }, { unique: true });
lectureInstanceSchema.index({ date: 1 });
lectureInstanceSchema.index({ status: 1 });
lectureInstanceSchema.index({ teacher: 1, date: 1 });
lectureInstanceSchema.index({ 'attendance.student': 1 });

// Method to mark attendance
lectureInstanceSchema.methods.markAttendance = function(studentId, status) {
  const existingIndex = this.attendance.findIndex(
    a => a.student.toString() === studentId.toString()
  );
  
  if (existingIndex >= 0) {
    this.attendance[existingIndex].status = status;
    this.attendance[existingIndex].checkedInAt = status === 'present' ? new Date() : null;
  } else {
    this.attendance.push({
      student: studentId,
      status: status,
      checkedInAt: status === 'present' ? new Date() : null
    });
  }
  
  return this.save();
};

// Method to add material
lectureInstanceSchema.methods.addMaterial = function(material) {
  this.materials.push(material);
  return this.save();
};

// Method to cancel lecture
lectureInstanceSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  return this.save();
};

// Method to postpone lecture
lectureInstanceSchema.methods.postpone = function(newDate, reason) {
  this.status = 'postponed';
  this.notes = reason || 'Postponed to ' + newDate.toISOString();
  return this.save();
};

// Virtual for attendance statistics
lectureInstanceSchema.virtual('attendanceStats').get(function() {
  const total = this.attendance.length;
  if (total === 0) return null;
  
  const stats = {
    total: total,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendanceRate: 0
  };
  
  this.attendance.forEach(a => {
    stats[a.status]++;
  });
  
  stats.attendanceRate = ((stats.present + stats.late) / total * 100).toFixed(2);
  
  return stats;
});

// Virtual to check if instance is upcoming
lectureInstanceSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date() && this.status === 'scheduled';
});

// Virtual to check if instance is past
lectureInstanceSchema.virtual('isPast').get(function() {
  return this.date < new Date();
});

const LectureInstance = (models && models.LectureInstance) || model('LectureInstance', lectureInstanceSchema);

export default LectureInstance;
