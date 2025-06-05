# Enhanced Unit Registration System - Implementation Plan

## Overview
This plan outlines the implementation of the remaining features for the student unit registration system:
1. Maximum unit registration limit (8 units)
2. Registration period (20 days from semester start)
3. Unit capacity limits
4. Prerequisite checking

## 1. Database Schema Updates

### A. Update Unit Model
Add fields for capacity and prerequisites:

```javascript
// src/models/Unit.js - Add these fields
capacity: {
  type: Number,
  default: null, // null means unlimited
  min: 0
},
prerequisites: [{
  type: Schema.Types.ObjectId,
  ref: 'Unit'
}],
description: {
  type: String
}
```

### B. Update Semester Model
Add registration period fields:

```javascript
// src/models/Semester.js - Add these fields
registrationStartDate: {
  type: Date,
  required: true
},
registrationEndDate: {
  type: Date,
  required: true
},
maxUnitsPerStudent: {
  type: Number,
  default: 8,
  min: 1
}
```

### C. Add Virtual Fields and Methods

```javascript
// In Semester model
semesterSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  return now >= this.registrationStartDate && now <= this.registrationEndDate;
});

semesterSchema.virtual('registrationDaysRemaining').get(function() {
  const now = new Date();
  if (now > this.registrationEndDate) return 0;
  if (now < this.registrationStartDate) return -1; // Not started yet
  
  const diffTime = Math.abs(this.registrationEndDate - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// In Unit model
unitSchema.virtual('enrolledCount', {
  ref: 'UnitRegistration',
  localField: '_id',
  foreignField: 'unit',
  count: true,
  match: { status: 'active' }
});

unitSchema.virtual('availableSlots').get(function() {
  if (!this.capacity) return null; // Unlimited
  return Math.max(0, this.capacity - (this.enrolledCount || 0));
});
```

## 2. Enhanced Validation Logic

### A. Registration Validation Service
Create a comprehensive validation service:

```javascript
// src/lib/services/registrationValidation.js
export class RegistrationValidationService {
  static async validateRegistration(studentId, unitId, semesterId) {
    const errors = [];
    
    // 1. Check semester registration period
    const semester = await Semester.findById(semesterId);
    if (!semester.isRegistrationOpen) {
      errors.push({
        code: 'REGISTRATION_CLOSED',
        message: `Registration period is closed. Registration was open from ${semester.registrationStartDate} to ${semester.registrationEndDate}`
      });
    }
    
    // 2. Check maximum units limit
    const currentRegistrations = await UnitRegistration.countDocuments({
      student: studentId,
      semester: semesterId,
      status: 'active'
    });
    
    if (currentRegistrations >= semester.maxUnitsPerStudent) {
      errors.push({
        code: 'MAX_UNITS_EXCEEDED',
        message: `Maximum unit limit (${semester.maxUnitsPerStudent}) reached`
      });
    }
    
    // 3. Check unit capacity
    const unit = await Unit.findById(unitId).populate('enrolledCount');
    if (unit.capacity && unit.enrolledCount >= unit.capacity) {
      errors.push({
        code: 'UNIT_FULL',
        message: `Unit is full (${unit.enrolledCount}/${unit.capacity} enrolled)`
      });
    }
    
    // 4. Check prerequisites
    if (unit.prerequisites && unit.prerequisites.length > 0) {
      const completedUnits = await UnitRegistration.find({
        student: studentId,
        unit: { $in: unit.prerequisites },
        status: 'completed',
        grade: { $gte: 50 } // Assuming 50 is passing grade
      }).populate('unit');
      
      const completedUnitIds = completedUnits.map(reg => reg.unit._id.toString());
      const missingPrereqs = unit.prerequisites.filter(
        prereqId => !completedUnitIds.includes(prereqId.toString())
      );
      
      if (missingPrereqs.length > 0) {
        const missingUnits = await Unit.find({ _id: { $in: missingPrereqs } });
        errors.push({
          code: 'MISSING_PREREQUISITES',
          message: `Missing prerequisites: ${missingUnits.map(u => u.code).join(', ')}`
        });
      }
    }
    
    // 5. Check if already registered
    const existing = await UnitRegistration.findOne({
      student: studentId,
      unit: unitId,
      semester: semesterId,
      status: { $ne: 'dropped' }
    });
    
    if (existing) {
      errors.push({
        code: 'ALREADY_REGISTERED',
        message: 'Already registered for this unit'
      });
    }
    
    // 6. Check if student is enrolled in the course
    const user = await User.findById(studentId);
    if (!user.course || user.course.toString() !== unit.course.toString()) {
      errors.push({
        code: 'NOT_ENROLLED_IN_COURSE',
        message: 'You must be enrolled in the course to register for this unit'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## 3. API Updates

### A. Update Unit Registration POST endpoint
```javascript
// src/app/api/unit-registrations/route.js - Update POST method
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unitId, semesterId } = await request.json();
    
    // Use the validation service
    const validation = await RegistrationValidationService.validateRegistration(
      session.user.id,
      unitId,
      semesterId
    );
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Registration validation failed',
        validationErrors: validation.errors 
      }, { status: 400 });
    }

    const registration = await UnitRegistration.create({
      student: session.user.id,
      unit: unitId,
      semester: semesterId
    });

    const populatedRegistration = await UnitRegistration.findById(registration._id)
      .populate('unit')
      .populate('semester');

    return NextResponse.json(populatedRegistration, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### B. Update Available Units endpoint
```javascript
// src/app/api/unit-registrations/available/route.js
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');

    await connectDB();

    // Get user's course
    const user = await User.findById(session.user.id);
    if (!user.course) {
      return NextResponse.json({ error: 'Not enrolled in any course' }, { status: 400 });
    }

    // Get semester with registration info
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }

    // Get units for the course in this semester
    const units = await Unit.find({
      course: user.course,
      _id: { $in: semester.units }
    }).populate('prerequisites');

    // Get student's registrations
    const registrations = await UnitRegistration.find({
      student: session.user.id,
      semester: semesterId
    });

    const registeredUnitIds = registrations
      .filter(reg => reg.status !== 'dropped')
      .map(reg => reg.unit.toString());

    // Get completed units for prerequisite checking
    const completedRegistrations = await UnitRegistration.find({
      student: session.user.id,
      status: 'completed',
      grade: { $gte: 50 }
    });

    const completedUnitIds = completedRegistrations.map(reg => reg.unit.toString());

    // Get enrollment counts for each unit
    const enrollmentCounts = await UnitRegistration.aggregate([
      {
        $match: {
          semester: mongoose.Types.ObjectId(semesterId),
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$unit',
          count: { $sum: 1 }
        }
      }
    ]);

    const enrollmentMap = enrollmentCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    // Process units with additional info
    const processedUnits = units.map(unit => {
      const enrolledCount = enrollmentMap[unit._id.toString()] || 0;
      const isRegistered = registeredUnitIds.includes(unit._id.toString());
      const isFull = unit.capacity && enrolledCount >= unit.capacity;
      
      // Check prerequisites
      const hasPrerequisites = unit.prerequisites && unit.prerequisites.length > 0;
      const prerequisitesMet = !hasPrerequisites || 
        unit.prerequisites.every(prereq => completedUnitIds.includes(prereq.toString()));

      return {
        ...unit.toObject(),
        enrolledCount,
        availableSlots: unit.capacity ? Math.max(0, unit.capacity - enrolledCount) : null,
        isRegistered,
        isFull,
        hasPrerequisites,
        prerequisitesMet,
        canRegister: !isRegistered && !isFull && prerequisitesMet && semester.isRegistrationOpen
      };
    });

    // Get current registration count
    const activeRegistrationCount = registrations.filter(reg => reg.status === 'active').length;

    return NextResponse.json({
      units: processedUnits,
      registrationInfo: {
        currentCount: activeRegistrationCount,
        maxAllowed: semester.maxUnitsPerStudent,
        canRegisterMore: activeRegistrationCount < semester.maxUnitsPerStudent,
        registrationOpen: semester.isRegistrationOpen,
        registrationStartDate: semester.registrationStartDate,
        registrationEndDate: semester.registrationEndDate,
        daysRemaining: semester.registrationDaysRemaining
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## 4. Frontend Components Updates

### A. Update UnitRegistration Component
```javascript
// src/components/UnitRegistration.js - Key updates
import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';

export default function UnitRegistration() {
  const [registrationInfo, setRegistrationInfo] = useState(null);
  
  // ... existing code ...

  return (
    <div className="space-y-6">
      {/* Registration Period Banner */}
      {registrationInfo && (
        <div className={`p-4 rounded-lg ${
          registrationInfo.registrationOpen 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className="font-semibold mb-2">
            Registration Period: {format(new Date(registrationInfo.registrationStartDate), 'MMM d')} - 
            {format(new Date(registrationInfo.registrationEndDate), 'MMM d, yyyy')}
          </h3>
          
          {registrationInfo.registrationOpen ? (
            <div>
              <p className="text-green-700">
                Registration is OPEN - {registrationInfo.daysRemaining} days remaining
              </p>
              <p className="text-sm mt-1">
                You have registered for {registrationInfo.currentCount} out of {registrationInfo.maxAllowed} allowed units
              </p>
            </div>
          ) : (
            <p className="text-red-700">
              Registration is CLOSED
            </p>
          )}
        </div>
      )}

      {/* Units Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableUnits.map((unit) => (
          <div key={unit._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">{unit.code}</h4>
                <p className="text-sm text-gray-600">{unit.name}</p>
              </div>
              {unit.capacity && (
                <span className={`text-sm px-2 py-1 rounded ${
                  unit.isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {unit.enrolledCount}/{unit.capacity}
                </span>
              )}
            </div>

            {/* Prerequisites */}
            {unit.hasPrerequisites && (
              <div className="mb-2">
                <p className="text-xs text-gray-500">Prerequisites:</p>
                <p className={`text-sm ${unit.prerequisitesMet ? 'text-green-600' : 'text-red-600'}`}>
                  {unit.prerequisites.map(p => p.code).join(', ')}
                  {!unit.prerequisitesMet && ' (Not met)'}
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => handleRegister(unit._id)}
              disabled={!unit.canRegister || !registrationInfo?.canRegisterMore}
              className={`w-full py-2 px-4 rounded transition-colors ${
                unit.isRegistered
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : unit.canRegister && registrationInfo?.canRegisterMore
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {unit.isRegistered ? 'Registered' :
               unit.isFull ? 'Full' :
               !unit.prerequisitesMet ? 'Prerequisites Required' :
               !registrationInfo?.registrationOpen ? 'Registration Closed' :
               !registrationInfo?.canRegisterMore ? 'Max Units Reached' :
               'Register'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### B. Update SemesterInfo Component
```javascript
// src/components/SemesterInfo.js - Add registration period info
export default function SemesterInfo({ semester }) {
  const registrationStatus = () => {
    if (!semester) return null;
    
    const now = new Date();
    const regStart = new Date(semester.registrationStartDate);
    const regEnd = new Date(semester.registrationEndDate);
    
    if (now < regStart) {
      const daysUntil = differenceInDays(regStart, now);
      return {
        status: 'upcoming',
        message: `Registration opens in ${daysUntil} days`,
        color: 'yellow'
      };
    } else if (now <= regEnd) {
      const daysRemaining = differenceInDays(regEnd, now);
      return {
        status: 'open',
        message: `Registration open - ${daysRemaining} days remaining`,
        color: 'green'
      };
    } else {
      return {
        status: 'closed',
        message: 'Registration closed',
        color: 'red'
      };
    }
  };

  const status = registrationStatus();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Current Semester</h2>
      
      {semester ? (
        <div className="space-y-3">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{semester.name}</p>
          </div>
          
          <div>
            <p className="text-gray-600">Duration</p>
            <p className="font-medium">
              {format(new Date(semester.startDate), 'MMM d, yyyy')} - 
              {format(new Date(semester.endDate), 'MMM d, yyyy')}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600">Registration Period</p>
            <p className="font-medium">
              {format(new Date(semester.registrationStartDate), 'MMM d')} - 
              {format(new Date(semester.registrationEndDate), 'MMM d, yyyy')}
            </p>
            <p className={`text-sm mt-1 text-${status.color}-600`}>
              {status.message}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600">Maximum Units Allowed</p>
            <p className="font-medium">{semester.maxUnitsPerStudent} units</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No active semester</p>
      )}
    </div>
  );
}
```

## 5. Admin Features

### A. Unit Management Updates
Add capacity and prerequisites management to UnitForm:

```javascript
// src/components/UnitForm.js - Add these fields
<div>
  <label className="block text-sm font-medium text-gray-700">
    Capacity (leave empty for unlimited)
  </label>
  <input
    type="number"
    min="0"
    value={formData.capacity || ''}
    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
    className="mt-1 block w-full rounded-md border-gray-300"
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700">
    Prerequisites
  </label>
  <select
    multiple
    value={formData.prerequisites || []}
    onChange={(e) => {
      const selected = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({ ...formData, prerequisites: selected });
    }}
    className="mt-1 block w-full rounded-md border-gray-300"
  >
    {availableUnits.map(unit => (
      <option key={unit._id} value={unit._id}>
        {unit.code} - {unit.name}
      </option>
    ))}
  </select>
</div>
```

### B. Semester Management Updates
Update SemesterManager to include registration period:

```javascript
// src/components/SemesterManager.js - Add registration period fields
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Registration Start Date
    </label>
    <input
      type="date"
      required
      value={formData.registrationStartDate}
      onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
      min={formData.startDate}
      max={formData.endDate}
      className="mt-1 block w-full rounded-md border-gray-300"
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Registration End Date
    </label>
    <input
      type="date"
      required
      value={formData.registrationEndDate}
      onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
      min={formData.registrationStartDate || formData.startDate}
      max={formData.endDate}
      className="mt-1 block w-full rounded-md border-gray-300"
    />
  </div>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700">
    Maximum Units per Student
  </label>
  <input
    type="number"
    required
    min="1"
    value={formData.maxUnitsPerStudent || 8}
    onChange={(e) => setFormData({ ...formData, maxUnitsPerStudent: parseInt(e.target.value) })}
    className="mt-1 block w-full rounded-md border-gray-300"
  />
</div>
```

## 6. Migration Scripts

### A. Update existing semesters
```javascript
// scripts/updateSemesters.js
import { connectDB } from '../src/lib/db';
import Semester from '../src/models/Semester';

async function updateSemesters() {
  await connectDB();
  
  const semesters = await Semester.find({});
  
  for (const semester of semesters) {
    // Set registration period to first 20 days of semester
    if (!semester.registrationStartDate) {
      semester.registrationStartDate = semester.startDate;
      semester.registrationEndDate = new Date(
        semester.startDate.getTime() + (20 * 24 * 60 * 60 * 1000)
      );
      semester.maxUnitsPerStudent = 8;
      await semester.save();
    }
  }
  
  console.log('Updated all semesters with registration periods');
}

updateSemesters();
```

## 7. Testing Scenarios

### A. Registration Period Tests
1. Test registration before period opens
2. Test registration during open period
3. Test registration after period closes
4. Test countdown display

### B. Capacity Tests
1. Test unit with no capacity limit
2. Test unit reaching capacity
3. Test full unit display
4. Test concurrent registrations

### C. Prerequisite Tests
1. Test unit with no prerequisites
2. Test unit with met prerequisites
3. Test unit with unmet prerequisites
4. Test multiple prerequisites

### D. Maximum Units Tests
1. Test registering up to limit
2. Test exceeding limit
3. Test dropping and re-registering

## 8. Error Handling

### A. User-Friendly Error Messages
```javascript
const errorMessages = {
  REGISTRATION_CLOSED: 'The registration period has ended. Please contact your academic advisor.',
  MAX_UNITS_EXCEEDED: 'You have reached the maximum number of units allowed for this semester.',
  UNIT_FULL: 'This unit is full. Please select another unit or contact your department.',
  MISSING_PREREQUISITES: 'You must complete the prerequisite units before registering for this unit.',
  ALREADY_REGISTERED: 'You are already registered for this unit.',
  NOT_ENROLLED_IN_COURSE: 'This unit is not available for your course.'
};
```

### B. Graceful Degradation
- Show clear messages when registration is closed
- Disable buttons with explanatory tooltips
- Provide alternative actions (waitlist, contact advisor)

## 9. Performance Optimizations

### A. Database Indexes
```javascript
// Add indexes for common queries
unitRegistrationSchema.index({ student: 1, semester: 1, status: 1 });
unitRegistrationSchema.index({ unit: 1, semester: 1, status: 1 });
unitSchema.index({ course: 1 });
```

### B. Caching Strategy
- Cache available units per semester
- Cache enrollment counts
- Invalidate cache on registration changes

## 10. Deployment Checklist

1. [ ] Update database schemas
2. [ ] Run migration scripts
3. [ ] Update API endpoints
4. [ ] Deploy frontend changes
5. [ ] Test registration flow
6. [ ] Monitor for errors
7. [ ] Update documentation
8. [ ] Train support staff

## Summary

This implementation adds:
1. **Registration Period**: 20-day window at semester start
2. **Maximum Units**: 8 units per student per semester
3. **Unit Capacity**: Optional capacity limits with real-time availability
4. **Prerequisites**: Enforce completion of prerequisite units
5. **Enhanced Validation**: Comprehensive checks before registration
6. **Better UX**: Clear status messages and disabled states
7. **Admin Controls**: Manage all aspects of registration

The system now provides a complete unit registration experience with proper constraints and validation.
