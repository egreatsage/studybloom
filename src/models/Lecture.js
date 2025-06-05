import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const lectureSchema = new Schema({
  timetable: { 
    type: Schema.Types.ObjectId, 
    ref: 'Timetable', 
    required: true 
  },
  unit: { 
    type: Schema.Types.ObjectId, 
    ref: 'Unit', 
    required: true 
  },
  teacher: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6 // 0 = Sunday, 6 = Saturday
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  venue: {
    building: {
      type: String,
      required: function() {
        return !this.metadata?.isOnline;
      }
    },
    room: {
      type: String,
      required: function() {
        return !this.metadata?.isOnline;
      }
    },
    capacity: {
      type: Number,
      min: 0
    }
  },
  lectureType: {
    type: String,
    enum: ['lecture', 'tutorial', 'lab', 'seminar'],
    default: 'lecture'
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    default: 'weekly'
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    match: /^#[0-9A-F]{6}$/i // Hex color validation
  },
  metadata: {
    credits: {
      type: Number,
      default: 1
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    onlineLink: {
      type: String,
      default: null
    }
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
lectureSchema.index({ timetable: 1, dayOfWeek: 1 });
lectureSchema.index({ unit: 1 });
lectureSchema.index({ teacher: 1 });
lectureSchema.index({ 'venue.building': 1, 'venue.room': 1 });

// Validation to ensure endTime is after startTime
lectureSchema.pre('save', function(next) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

// Method to check for time conflicts
lectureSchema.methods.hasTimeConflict = async function(otherLecture) {
  if (this.dayOfWeek !== otherLecture.dayOfWeek) return false;
  
  const thisStart = this.startTime.split(':').map(Number);
  const thisEnd = this.endTime.split(':').map(Number);
  const otherStart = otherLecture.startTime.split(':').map(Number);
  const otherEnd = otherLecture.endTime.split(':').map(Number);
  
  const thisStartMin = thisStart[0] * 60 + thisStart[1];
  const thisEndMin = thisEnd[0] * 60 + thisEnd[1];
  const otherStartMin = otherStart[0] * 60 + otherStart[1];
  const otherEndMin = otherEnd[0] * 60 + otherEnd[1];
  
  return (thisStartMin < otherEndMin && thisEndMin > otherStartMin);
};

// Virtual for duration in minutes
lectureSchema.virtual('duration').get(function() {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  return (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
});

// Virtual for day name
lectureSchema.virtual('dayName').get(function() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[this.dayOfWeek];
});

const Lecture = (models && models.Lecture) || model('Lecture', lectureSchema);

export default Lecture;
