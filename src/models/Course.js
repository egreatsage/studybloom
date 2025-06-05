import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const courseSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  code: { 
    type: String, 
    required: true,
    unique: true
  },
  description: { 
    type: String,
    required: true
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  }
}, { 
  timestamps: true 
});

// Create a compound index on code and school to ensure unique codes within a school
courseSchema.index({ code: 1, school: 1 }, { unique: true });

const Course = models.Course || model('Course', courseSchema);

export default Course;
