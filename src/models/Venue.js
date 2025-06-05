import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const maintenanceScheduleSchema = new Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  }
}, { _id: false });

const venueSchema = new Schema({
  building: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['lecture_hall', 'lab', 'tutorial_room', 'auditorium', 'seminar_room'],
    default: 'lecture_hall'
  },
  facilities: [{
    type: String,
    enum: ['projector', 'whiteboard', 'computers', 'air_conditioning', 'sound_system', 'video_conferencing', 'smart_board']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maintenanceSchedule: [maintenanceScheduleSchema]
}, { 
  timestamps: true 
});

// Create compound unique index for building and room
venueSchema.index({ building: 1, room: 1 }, { unique: true });
venueSchema.index({ type: 1 });
venueSchema.index({ capacity: 1 });
venueSchema.index({ isActive: 1 });

// Method to check if venue is available on a specific date
venueSchema.methods.isAvailableOn = function(date) {
  if (!this.isActive) return false;
  
  const checkDate = new Date(date);
  
  // Check maintenance schedule
  for (const maintenance of this.maintenanceSchedule) {
    if (checkDate >= maintenance.startDate && checkDate <= maintenance.endDate) {
      return false;
    }
  }
  
  return true;
};

// Method to add maintenance period
venueSchema.methods.addMaintenance = function(startDate, endDate, reason) {
  // Validate dates
  if (endDate <= startDate) {
    throw new Error('End date must be after start date');
  }
  
  // Check for overlapping maintenance
  for (const maintenance of this.maintenanceSchedule) {
    if (
      (startDate >= maintenance.startDate && startDate <= maintenance.endDate) ||
      (endDate >= maintenance.startDate && endDate <= maintenance.endDate) ||
      (startDate <= maintenance.startDate && endDate >= maintenance.endDate)
    ) {
      throw new Error('Maintenance period overlaps with existing schedule');
    }
  }
  
  this.maintenanceSchedule.push({ startDate, endDate, reason });
  return this.save();
};

// Method to remove past maintenance records
venueSchema.methods.cleanupMaintenance = function() {
  const now = new Date();
  this.maintenanceSchedule = this.maintenanceSchedule.filter(
    m => m.endDate >= now
  );
  return this.save();
};

// Virtual for venue code
venueSchema.virtual('code').get(function() {
  return `${this.building}-${this.room}`;
});

// Virtual for current status
venueSchema.virtual('currentStatus').get(function() {
  if (!this.isActive) return 'inactive';
  
  const now = new Date();
  for (const maintenance of this.maintenanceSchedule) {
    if (now >= maintenance.startDate && now <= maintenance.endDate) {
      return 'maintenance';
    }
  }
  
  return 'available';
});

// Static method to find available venues
venueSchema.statics.findAvailable = async function(date, capacity = 0, type = null) {
  const query = {
    isActive: true,
    capacity: { $gte: capacity }
  };
  
  if (type) {
    query.type = type;
  }
  
  const venues = await this.find(query);
  
  // Filter by availability on the specific date
  return venues.filter(venue => venue.isAvailableOn(date));
};

const Venue = (models && models.Venue) || model('Venue', venueSchema);

export default Venue;
