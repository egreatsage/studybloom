import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const unitAssignmentSchema = new Schema({
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

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
  },
  semester: {
    type: Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  units: [unitAssignmentSchema]
}, { 
  timestamps: true 
});

// Create a compound unique index on teacher, course, and semester to prevent duplicate assignments
teachingAssignmentSchema.index({ teacher: 1, course: 1, semester: 1 }, { unique: true });
teachingAssignmentSchema.index({ 'units.unit': 1 });

// Method to assign a unit to the teacher
teachingAssignmentSchema.methods.assignUnit = function(unitId) {
  const existingAssignment = this.units.find(
    u => u.unit.toString() === unitId.toString()
  );
  
  if (existingAssignment) {
    existingAssignment.isActive = true;
    existingAssignment.assignedAt = new Date();
  } else {
    this.units.push({
      unit: unitId,
      assignedAt: new Date(),
      isActive: true
    });
  }
  
  return this.save();
};

// Method to unassign a unit
teachingAssignmentSchema.methods.unassignUnit = function(unitId) {
  const assignment = this.units.find(
    u => u.unit.toString() === unitId.toString()
  );
  
  if (assignment) {
    assignment.isActive = false;
  }
  
  return this.save();
};

// Virtual to get active units
teachingAssignmentSchema.virtual('activeUnits').get(function() {
  return this.units.filter(u => u.isActive);
});

const TeachingAssignment = (models && models.TeachingAssignment) || model('TeachingAssignment', teachingAssignmentSchema);

export default TeachingAssignment;
