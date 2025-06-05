import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const enrollmentSchema = new Schema({
  student: { 
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

// Create a compound unique index on student and course to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = (models && models.Enrollment) || model('Enrollment', enrollmentSchema);

export default Enrollment;
