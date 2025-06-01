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
  }
}, { 
  timestamps: true 
});

const Course = models.Course || model('Course', courseSchema);

export default Course;
