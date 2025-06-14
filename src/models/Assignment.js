// src/models/Assignment.js

import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const submissionSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  files: [{
    url: { type: String, required: true },
    name: { type: String, required: true },
  }],
  // ADD THE COMMENT FIELD
  comment: {
    type: String,
    trim: true,
  },
  submittedAt: { 
    type: Date,
    default: Date.now
  },
  grade: { 
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  feedback: {
    type: String,
    trim: true
  },
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null // MAKE THIS OPTIONAL
  },
  gradedAt: {
    type: Date,
    default: null // MAKE THIS OPTIONAL
  }
}, {
  timestamps: true
});

const assignmentSchema = new Schema({
  //... (rest of the assignmentSchema remains the same)
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  fileUrl: { 
    type: String,
  },
  dueDate: { 
    type: Date,
    required: true
  },
  unit: { 
    type: Schema.Types.ObjectId, 
    ref: 'Unit', 
    required: true 
  },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  submissions: [submissionSchema]
}, { 
  timestamps: true 
});

// Index for faster queries
assignmentSchema.index({ unit: 1 });
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

const Assignment = (models && models.Assignment) || model('Assignment', assignmentSchema);

export default Assignment;