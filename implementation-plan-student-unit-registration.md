# Student Unit Registration System - Implementation Plan

## Overview
This plan outlines the implementation of a student unit registration system that allows students enrolled in a course to register for units offered in the current semester, with validation based on semester start and end dates.

## Current System Analysis

### Existing Models:
1. **User Model**: Has a `course` field for students/teachers
2. **Course Model**: Basic course information
3. **Unit Model**: Units belong to courses
4. **Semester Model**: Has `startDate`, `endDate`, `courses[]`, and `units[]`
5. **Enrollment Model**: Links students to courses (but currently redundant with User.course)

### Issues Identified:
1. Students are assigned to courses directly in the User model, but also have an Enrollment model
2. No model exists for unit registration (student-to-unit relationship)
3. No semester validation for registrations
4. Student components exist but lack proper unit registration functionality

## Proposed Solution

### 1. Database Schema Updates

#### A. Create UnitRegistration Model
```javascript
// src/models/UnitRegistration.js
const unitRegistrationSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  unit: { 
    type: Schema.Types.ObjectId, 
    ref: 'Unit', 
    required: true 
  },
  semester: { 
    type: Schema.Types.ObjectId, 
    ref: 'Semester', 
    required: true 
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'dropped', 'completed'],
    default: 'active'
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  }
}, { 
  timestamps: true 
});

// Compound unique index to prevent duplicate registrations
unitRegistrationSchema.index({ student: 1, unit: 1, semester: 1 }, { unique: true });
```

#### B. Update Semester Model
- Add `isActive` computed field based on current date
- Add methods to check if registration is allowed

#### C. Update Unit Model
- Add virtual field for registered students count
- Add semester association

### 2. API Endpoints

#### A. Unit Registration Endpoints
- `GET /api/unit-registrations` - Get student's registered units
- `POST /api/unit-registrations` - Register for a unit
- `DELETE /api/unit-registrations/:id` - Drop a unit
- `GET /api/unit-registrations/available` - Get available units for registration

#### B. Semester Management
- `GET /api/semesters/current` - Get current active semester
- `GET /api/semesters/:id/units` - Get units offered in a semester

### 3. Business Logic Implementation

#### A. Registration Validation Rules
1. Student must be enrolled in the course that offers the unit
2. Registration must happen within semester dates
3. Cannot register for the same unit twice in a semester
4. Optional: Add unit capacity limits
5. Optional: Add prerequisite checking

#### B. Semester Validation
```javascript
// Helper function to check if registration is allowed
const canRegisterForUnit = async (studentId, unitId, semesterId) => {
  // 1. Check if semester is active
  const semester = await Semester.findById(semesterId);
  const now = new Date();
  if (now < semester.startDate || now > semester.endDate) {
    throw new Error('Registration is not open for this semester');
  }

  // 2. Check if student is enrolled in the course
  const unit = await Unit.findById(unitId).populate('course');
  const user = await User.findById(studentId);
  if (user.course.toString() !== unit.course._id.toString()) {
    throw new Error('You must be enrolled in the course to register for this unit');
  }

  // 3. Check for duplicate registration
  const existing = await UnitRegistration.findOne({
    student: studentId,
    unit: unitId,
    semester: semesterId
  });
  if (existing) {
    throw new Error('Already registered for this unit in this semester');
  }

  return true;
};
```

### 4. Frontend Components

#### A. Update Student Dashboard
1. Show current semester information
2. Display registration status and deadlines
3. Add "Register for Units" section

#### B. Create New Components
1. **UnitRegistration Component**
   - Display available units for the student's course
   - Show units already registered
   - Allow registration/dropping within semester dates

2. **SemesterInfo Component**
   - Display current semester details
   - Show registration period status
   - Countdown to registration deadline

3. **RegisteredUnits Component**
   - List all registered units for current semester
   - Show unit details and status
   - Option to drop units

#### C. Update Existing Components
1. **StudentCoursesTable**: Add link to unit registration
2. **UnitsList**: Add registration button for students
3. **StudentDashboard**: Integrate semester and registration info

### 5. State Management

#### A. Create Unit Registration Store
```javascript
// src/lib/stores/unitRegistrationStore.js
const useUnitRegistrationStore = create((set) => ({
  registrations: [],
  availableUnits: [],
  currentSemester: null,
  loading: false,
  error: null,

  fetchCurrentSemester: async () => {
    // Fetch current active semester
  },

  fetchRegistrations: async () => {
    // Fetch student's registered units
  },

  fetchAvailableUnits: async (courseId) => {
    // Fetch units available for registration
  },

  registerForUnit: async (unitId, semesterId) => {
    // Register for a unit with validation
  },

  dropUnit: async (registrationId) => {
    // Drop a registered unit
  }
}));
```

### 6. UI/UX Flow

#### Student Registration Flow:
1. Student logs in and sees dashboard
2. Dashboard shows current semester and registration status
3. Student clicks "Register for Units"
4. System shows available units for their course in current semester
5. Student selects units to register
6. System validates and confirms registration
7. Student can view/drop registered units

### 7. Implementation Steps

#### Phase 1: Backend Foundation
1. Create UnitRegistration model
2. Update Semester model with validation methods
3. Create unit registration API endpoints
4. Add validation middleware

#### Phase 2: Core Frontend
1. Create unit registration store
2. Build UnitRegistration component
3. Update student dashboard
4. Add semester information display

#### Phase 3: Integration
1. Connect frontend to backend APIs
2. Implement real-time validation
3. Add error handling and loading states
4. Test registration flow

#### Phase 4: Enhancements
1. Add unit capacity management
2. Implement prerequisite checking
3. Add registration history
4. Create registration reports for admins

### 8. Security Considerations

1. **Authentication**: Ensure only authenticated students can register
2. **Authorization**: Students can only register for units in their enrolled course
3. **Data Validation**: Validate all inputs on both frontend and backend
4. **Rate Limiting**: Prevent spam registrations
5. **Audit Trail**: Log all registration activities

### 9. Testing Strategy

1. **Unit Tests**:
   - Model validation
   - Registration business logic
   - API endpoints

2. **Integration Tests**:
   - Full registration flow
   - Semester validation
   - Error scenarios

3. **E2E Tests**:
   - Student registration journey
   - Edge cases (semester boundaries)
   - Concurrent registrations

### 10. Future Enhancements

1. **Waitlist System**: For full units
2. **Prerequisite Management**: Enforce unit dependencies
3. **Timetable Integration**: Check for schedule conflicts
4. **Bulk Registration**: Register for multiple units at once
5. **Registration Periods**: Different periods for different student years
6. **Email Notifications**: Confirmation and reminders
7. **Mobile App Support**: Native mobile registration

## Conclusion

This plan provides a comprehensive approach to implementing student unit registration within semesters. The system will ensure students can only register for units during active semesters and only for units within their enrolled course. The implementation is modular and can be enhanced with additional features as needed.
