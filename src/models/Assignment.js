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
  },
  feedback: {
    type: String,
    trim: true
  },
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  gradedAt: {
    type: Date,
  }
}, {
  timestamps: true
});

const assignmentSchema = new Schema({
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

  assessmentType: {
    type: String,
    enum: ['Assignment', 'CAT', 'Exam'],
    required: true,
    default: 'Assignment',
  },
  maxScore: {
    type: Number,
    required: true,
    default: 10,
  },

  submissions: [submissionSchema]
}, { 
  timestamps: true 
});


assignmentSchema.index({ unit: 1 });
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

const Assignment = (models && models.Assignment) || model('Assignment', assignmentSchema);

export default Assignment;