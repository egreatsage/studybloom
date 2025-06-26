import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const venueSchema = new Schema({
  building: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['lecture_hall', 'lab', 'tutorial_room', 'auditorium', 'seminar_room'],
    default: 'lecture_hall'
  }
}, { 
  timestamps: true 
});

// Create compound unique index for building and room
venueSchema.index({ building: 1, room: 1 }, { unique: true });
venueSchema.index({ type: 1 });

// Virtual for venue code
venueSchema.virtual('code').get(function() {
  return `${this.building}-${this.room}`;
});

const Venue = (models && models.Venue) || model('Venue', venueSchema);

export default Venue;
