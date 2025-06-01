import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const departmentSchema = new Schema({
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  head: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Department = models.Department || model('Department', departmentSchema);

export default Department;
