import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const teachingAssignmentSchema = new Schema({
  teacher: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  }
}, { 
  timestamps: true 
});

// Create a compound unique index on teacher and course to prevent duplicate assignments
teachingAssignmentSchema.index({ teacher: 1, course: 1 }, { unique: true });

const TeachingAssignment = models.TeachingAssignment || model('TeachingAssignment', teachingAssignmentSchema);

export default TeachingAssignment;
