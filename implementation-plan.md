# Implementation Plan for StudyBloom Restructuring

## 1. Database Model Changes

### A. Update Existing Models

1. User Model (`src/models/User.js`)
   - Remove course, school, department fields
   - Keep core fields: name, email, role, password, photoUrl
   - Update role enum to ['student', 'teacher', 'admin']
   - Remove parent role and children array

2. Course Model (`src/models/Course.js`)
   - Remove school and department references
   - Keep name and code fields
   - Add description field

### B. Create New Models

1. TeachingAssignment Model (`src/models/TeachingAssignment.js`)
   - teacher (ref: User)
   - course (ref: Course)
   - Unique composite index on {teacher, course}

2. Enrollment Model (`src/models/Enrollment.js`)
   - student (ref: User)
   - course (ref: Course)
   - Unique composite index on {student, course}

3. Unit Model (`src/models/Unit.js`)
   - name
   - code
   - course (ref: Course)
   - createdBy (ref: User)
   - Unique composite index on {code, course}

4. Assignment Model (`src/models/Assignment.js`)
   - title
   - description
   - dueDate
   - unit (ref: Unit)
   - course (ref: Course)
   - createdBy (ref: User)
   - submissions array with student submissions

## 2. API Routes Changes

### A. Update Existing Routes

1. Users API (`src/app/api/users/route.js`)
   - Remove role-specific fields handling
   - Simplify user creation/update

2. Courses API (`src/app/api/courses/route.js`)
   - Remove school/department dependencies
   - Add description field handling

### B. Create New Routes

1. Teaching Assignments API (`src/app/api/teaching-assignments/route.js`)
   - POST: Assign teacher to course
   - GET: Get teacher's courses or course's teachers
   - DELETE: Remove teaching assignment

2. Enrollments API (`src/app/api/enrollments/route.js`)
   - POST: Enroll student in course
   - GET: Get student's courses or course's students
   - DELETE: Remove enrollment

3. Units API (`src/app/api/units/route.js`)
   - CRUD operations for course units
   - Validation for teacher authorization

4. Assignments API (`src/app/api/assignments/route.js`)
   - CRUD operations for unit assignments
   - Submission handling endpoints
   - Grade management endpoints

## 3. Frontend Changes

### A. Update Existing Components

1. UserForm (`src/components/UserForm.js`)
   - Remove role-specific fields
   - Simplify to core user data

2. CourseForm (`src/components/CourseForm.js`)
   - Remove school/department fields
   - Add description field

### B. Create New Components

1. Teaching Management
   - TeacherAssignmentForm
   - CourseTeachersTable
   - TeacherCoursesTable

2. Enrollment Management
   - EnrollmentForm
   - CourseStudentsTable
   - StudentCoursesTable

3. Unit Management
   - UnitForm
   - UnitsList
   - UnitDetails

4. Assignment Management
   - AssignmentForm
   - AssignmentsList
   - AssignmentDetails
   - SubmissionForm
   - GradingInterface

### C. Create New Pages

1. Teacher Dashboard
   - List assigned courses
   - Manage units and assignments
   - View and grade submissions

2. Student Dashboard
   - List enrolled courses
   - View units and assignments
   - Submit assignments

## 4. Store Changes

### A. Update Existing Stores

1. userStore
   - Remove role-specific operations
   - Simplify user management

2. courseStore
   - Remove school/department dependencies
   - Add description handling

### B. Create New Stores

1. teachingStore
   - Manage teaching assignments
   - Handle teacher-course relationships

2. enrollmentStore
   - Manage student enrollments
   - Handle student-course relationships

3. unitStore
   - Manage course units
   - Handle unit CRUD operations

4. assignmentStore
   - Manage assignments
   - Handle submissions and grading

## 5. Implementation Order

1. Phase 1: Database Migration
   - Create new models
   - Update existing models
   - Create migration scripts

2. Phase 2: API Layer
   - Implement new API routes
   - Update existing routes
   - Add validation and authorization

3. Phase 3: Frontend Core
   - Update existing components
   - Create new base components
   - Implement new stores

4. Phase 4: Frontend Features
   - Build teacher dashboard
   - Build student dashboard
   - Implement assignment system

5. Phase 5: Testing & Refinement
   - Test all flows
   - Add error handling
   - Optimize performance

## 6. Additional Considerations

1. Authentication & Authorization
   - Update middleware for new roles
   - Implement role-based access control
   - Add course-level permissions

2. Data Migration
   - Plan for existing data migration
   - Create backup strategy
   - Test migration scripts

3. UI/UX
   - Design new interface flows
   - Ensure consistent styling
   - Add loading states and error handling
