import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const submissionSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  fileUrl: { 
    type: String,
    required: true
  },
  submittedAt: { 
    type: Date,
    default: Date.now
  },
  grade: { 
    type: Number,
    min: 0,
    max: 100
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

// Index on course for faster queries when listing assignments by course
assignmentSchema.index({ course: 1 });

const Assignment = models.Assignment || model('Assignment', assignmentSchema);

export default Assignment;
