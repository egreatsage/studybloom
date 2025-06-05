# Timetable and Lectures Module Implementation Plan

## Overview
This module will implement a comprehensive timetable system for managing and displaying class schedules, lectures, and academic calendars. The system will support:
- Admin-created timetables for semesters
- Teacher and student views of schedules
- Calendar integration for lessons
- Unit-based scheduling (units are the teachable entities)
- Course-based organization

## Key Stakeholders
1. **Admin**: Creates and manages timetables, assigns teachers to units, schedules lectures
2. **Teachers**: View their teaching schedule, manage lecture details
3. **Students**: View their class schedule based on registered units, access calendar view

## Database Schema Design

### 1. New Models

#### Timetable Model (`src/models/Timetable.js`)
```javascript
{
  semester: ObjectId (ref: 'Semester'),
  course: ObjectId (ref: 'Course'),
  effectiveFrom: Date,
  effectiveTo: Date,
  status: String (enum: ['draft', 'published', 'archived']),
  createdBy: ObjectId (ref: 'User'),
  publishedAt: Date,
  metadata: {
    totalWeeks: Number,
    hoursPerWeek: Number
  }
}
```

#### Lecture Model (`src/models/Lecture.js`)
```javascript
{
  timetable: ObjectId (ref: 'Timetable'),
  unit: ObjectId (ref: 'Unit'),
  teacher: ObjectId (ref: 'User'),
  dayOfWeek: Number (0-6, where 0 is Sunday),
  startTime: String (e.g., "09:00"),
  endTime: String (e.g., "11:00"),
  venue: {
    building: String,
    room: String,
    capacity: Number
  },
  lectureType: String (enum: ['lecture', 'tutorial', 'lab', 'seminar']),
  isRecurring: Boolean (default: true),
  frequency: String (enum: ['weekly', 'biweekly', 'monthly']),
  color: String (hex color for calendar display),
  metadata: {
    credits: Number,
    isOnline: Boolean,
    onlineLink: String
  }
}
```

#### LectureInstance Model (`src/models/LectureInstance.js`)
```javascript
{
  lecture: ObjectId (ref: 'Lecture'),
  date: Date,
  status: String (enum: ['scheduled', 'completed', 'cancelled', 'postponed']),
  actualStartTime: Date,
  actualEndTime: Date,
  attendance: [{
    student: ObjectId (ref: 'User'),
    status: String (enum: ['present', 'absent', 'late', 'excused']),
    checkedInAt: Date
  }],
  teacher: ObjectId (ref: 'User'), // Can be different for substitutions
  venue: { // Can be different from regular venue
    building: String,
    room: String
  },
  notes: String,
  cancellationReason: String,
  materials: [{
    title: String,
    url: String,
    type: String (enum: ['slides', 'assignment', 'reading', 'video'])
  }]
}
```

#### VenueModel (`src/models/Venue.js`)
```javascript
{
  building: String,
  room: String,
  capacity: Number,
  type: String (enum: ['lecture_hall', 'lab', 'tutorial_room', 'auditorium']),
  facilities: [String], // ['projector', 'whiteboard', 'computers', etc.]
  isActive: Boolean,
  maintenanceSchedule: [{
    startDate: Date,
    endDate: Date,
    reason: String
  }]
}
```

### 2. Model Updates

#### Update TeachingAssignment Model
Add fields for unit-specific assignments:
```javascript
{
  // existing fields...
  units: [{
    unit: ObjectId (ref: 'Unit'),
    assignedAt: Date,
    isActive: Boolean
  }],
  semester: ObjectId (ref: 'Semester')
}
```

## API Endpoints

### Admin Endpoints

1. **Timetable Management**
   - `POST /api/timetables` - Create new timetable
   - `GET /api/timetables` - List all timetables
   - `GET /api/timetables/:id` - Get specific timetable
   - `PUT /api/timetables/:id` - Update timetable
   - `DELETE /api/timetables/:id` - Delete timetable
   - `POST /api/timetables/:id/publish` - Publish timetable

2. **Lecture Scheduling**
   - `POST /api/lectures` - Create lecture slot
   - `GET /api/lectures` - List lectures with filters
   - `PUT /api/lectures/:id` - Update lecture
   - `DELETE /api/lectures/:id` - Delete lecture
   - `POST /api/lectures/bulk` - Bulk create lectures

3. **Venue Management**
   - `GET /api/venues` - List all venues
   - `POST /api/venues` - Create venue
   - `GET /api/venues/availability` - Check venue availability

### Teacher Endpoints

1. **Schedule Access**
   - `GET /api/teachers/schedule` - Get teacher's schedule
   - `GET /api/teachers/lectures` - Get assigned lectures
   - `PUT /api/lectures/:id/instance/:date` - Update specific lecture instance

### Student Endpoints

1. **Schedule Access**
   - `GET /api/students/schedule` - Get student's schedule based on registered units
   - `GET /api/students/calendar` - Get calendar view data
   - `GET /api/lectures/:id/instances` - Get lecture instances

## Frontend Components

### 1. Admin Components

#### TimetableManager (`src/components/admin/TimetableManager.js`)
- Create/edit timetables
- Select semester and course
- Set effective dates
- Publish/archive timetables

#### LectureScheduler (`src/components/admin/LectureScheduler.js`)
- Drag-and-drop interface for scheduling
- Weekly grid view
- Conflict detection
- Bulk operations
- Teacher assignment
- Venue selection

#### VenueManager (`src/components/admin/VenueManager.js`)
- Add/edit venues
- View venue utilization
- Maintenance scheduling

### 2. Shared Components

#### WeeklyTimetable (`src/components/timetable/WeeklyTimetable.js`)
- Grid-based weekly view
- Color-coded by unit/type
- Interactive tooltips
- Print-friendly version
- Export functionality

#### CalendarView (`src/components/timetable/CalendarView.js`)
- Monthly calendar display
- Day/week/month views
- Event details on click
- Filter by unit/type
- Integration with external calendars

#### LectureCard (`src/components/timetable/LectureCard.js`)
- Display lecture information
- Show venue details
- Teacher information
- Quick actions

### 3. Teacher Components

#### TeacherSchedule (`src/components/teacher/TeacherSchedule.js`)
- Personal schedule view
- Lecture management
- Attendance tracking
- Material uploads

### 4. Student Components

#### StudentSchedule (`src/components/student/StudentSchedule.js`)
- Personal timetable based on registered units
- Calendar sync options
- Lecture materials access
- Attendance status

## State Management

### TimetableStore (`src/lib/stores/timetableStore.js`)
```javascript
{
  // State
  timetables: [],
  currentTimetable: null,
  lectures: [],
  venues: [],
  filters: {},
  view: 'week', // 'day', 'week', 'month'
  
  // Actions
  fetchTimetables: async (filters) => {},
  fetchLectures: async (timetableId) => {},
  createLecture: async (lectureData) => {},
  updateLecture: async (lectureId, updates) => {},
  deleteLecture: async (lectureId) => {},
  publishTimetable: async (timetableId) => {},
  checkConflicts: async (lectureData) => {},
  exportTimetable: async (format) => {}
}
```

### ScheduleStore (`src/lib/stores/scheduleStore.js`)
```javascript
{
  // State
  mySchedule: [],
  calendarEvents: [],
  selectedDate: Date,
  viewMode: 'week',
  
  // Actions
  fetchMySchedule: async () => {},
  fetchCalendarEvents: async (startDate, endDate) => {},
  syncToCalendar: async (provider) => {},
  downloadSchedule: async (format) => {}
}
```

## Features Implementation

### 1. Conflict Detection
- Teacher double-booking prevention
- Venue availability checking
- Student schedule conflict warnings
- Unit prerequisite time conflicts

### 2. Calendar Integration
- iCal export
- Google Calendar sync
- Outlook integration
- Mobile calendar apps

### 3. Notifications
- Schedule changes
- Lecture cancellations
- Room changes
- Upcoming classes reminder

### 4. Reports
- Venue utilization reports
- Teacher workload analysis
- Student attendance patterns
- Timetable coverage statistics

## UI/UX Considerations

### 1. Responsive Design
- Mobile-friendly timetable view
- Touch-enabled drag-and-drop
- Collapsible sidebar navigation
- Swipe gestures for navigation

### 2. Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- Color-blind friendly palettes

### 3. Performance
- Lazy loading for large schedules
- Virtual scrolling for long lists
- Caching strategies
- Optimistic updates

## Implementation Phases

### Phase 1: Core Models and APIs (Week 1)
1. Create database models
2. Implement CRUD APIs
3. Set up authentication/authorization
4. Basic validation logic

### Phase 2: Admin Interface (Week 2)
1. Timetable creation interface
2. Lecture scheduling system
3. Venue management
4. Conflict detection

### Phase 3: Teacher and Student Views (Week 3)
1. Schedule display components
2. Calendar integration
3. Personal dashboard updates
4. Mobile responsiveness

### Phase 4: Advanced Features (Week 4)
1. Attendance tracking
2. Notifications system
3. Export/sync features
4. Analytics and reports

## Technical Considerations

### 1. Data Optimization
- Indexed queries for schedule lookups
- Aggregation pipelines for reports
- Caching frequently accessed data
- Pagination for large datasets

### 2. Real-time Updates
- WebSocket for live schedule changes
- Push notifications for mobile
- Email notifications for changes
- SMS alerts for urgent updates

### 3. Security
- Role-based access control
- Data validation and sanitization
- Audit logs for changes
- Secure venue booking system

### 4. Scalability
- Horizontal scaling for peak times
- Load balancing for API requests
- CDN for static assets
- Database sharding if needed

## Testing Strategy

### 1. Unit Tests
- Model validation
- API endpoint testing
- Component testing
- Store action testing

### 2. Integration Tests
- Full workflow testing
- Cross-component communication
- API integration
- Database transactions

### 3. E2E Tests
- User journey testing
- Schedule creation flow
- Student registration impact
- Calendar sync verification

## Success Metrics

1. **Performance**
   - Page load time < 2 seconds
   - Schedule generation < 1 second
   - API response time < 200ms

2. **Usability**
   - User satisfaction > 4.5/5
   - Task completion rate > 95%
   - Error rate < 2%

3. **Adoption**
   - 90% active user engagement
   - 80% mobile app usage
   - 70% calendar sync adoption

## Future Enhancements

1. **AI-Powered Scheduling**
   - Automatic conflict resolution
   - Optimal venue allocation
   - Teacher workload balancing

2. **Advanced Analytics**
   - Predictive attendance
   - Resource optimization
   - Performance insights

3. **Integration Expansion**
   - Video conferencing tools
   - Learning management systems
   - Student information systems

4. **Mobile App**
   - Native iOS/Android apps
   - Offline schedule access
   - Push notifications
   - QR code attendance
