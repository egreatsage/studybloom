// src/app/api/lectures/check-conflicts/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; // Adjust path as needed
import connectDB from '@/lib/mongodb';
import Lecture from '@/models/Lecture';
import Timetable from '@/models/Timetable';
import User from '@/models/User';
import Venue from '@/models/Venue'; // Import Venue model for availability checks
import Unit from '@/models/Unit';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    // Ensure only authenticated users can check conflicts
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const lectureData = await request.json();
    const {
      _id, // This would be present if checking for an existing lecture (e.g., during an update)
      timetable,
      unit, // Assuming unit ID is passed for teacher assignment check
      teacher,
      dayOfWeek,
      startTime,
      endTime,
      venue,
      metadata // To check for isOnline
    } = lectureData;

    const conflicts = [];
    const conflictDetails = [];

    // 1. Validate required fields for conflict check
    if (!timetable || !teacher || dayOfWeek === undefined || !startTime || !endTime) {
        return NextResponse.json(
            { error: 'Missing required fields for conflict check' },
            { status: 400 }
        );
    }

    // 2. Check for Teacher Conflicts
    // Find other lectures for the same teacher on the same day and within the same timetable
    const teacherConflictQuery = {
      timetable: timetable,
      teacher: teacher,
      dayOfWeek: dayOfWeek,
    };
    if (_id) { // Exclude the current lecture if it's an update scenario
      teacherConflictQuery._id = { $ne: _id };
    }

    const teacherConflictingLectures = await Lecture.find(teacherConflictQuery);

    for (const conflictingLecture of teacherConflictingLectures) {
      // Use the hasTimeConflict method from the Lecture model
      const hasConflict = await conflictingLecture.hasTimeConflict({ startTime, endTime, dayOfWeek });
      if (hasConflict) {
        conflicts.push('teacher');
        // Populate teacher and unit for better error message
        const conflictedTeacher = await User.findById(conflictingLecture.teacher).select('name');
        const conflictedUnit = await Unit.findById(conflictingLecture.unit).select('code name');
        conflictDetails.push({
          type: 'teacher',
          message: `Teacher ${conflictedTeacher?.name || 'Unknown'} is already scheduled for ${conflictedUnit?.code || 'Unknown Unit'} from ${conflictingLecture.startTime} to ${conflictingLecture.endTime} on ${conflictingLecture.dayName}.`
        });
        break; // Found a conflict, no need to check further for this teacher
      }
    }

    // 3. Check for Venue Conflicts (if not an online lecture)
    if (!(metadata && metadata.isOnline) && venue && venue.building && venue.room) {
        const venueConflictQuery = {
            timetable: timetable,
            'venue.building': venue.building,
            'venue.room': venue.room,
            dayOfWeek: dayOfWeek,
        };
        if (_id) { // Exclude the current lecture if it's an update scenario
          venueConflictQuery._id = { $ne: _id };
        }

        const venueConflictingLectures = await Lecture.find(venueConflictQuery);

        for (const conflictingLecture of venueConflictingLectures) {
            const hasConflict = await conflictingLecture.hasTimeConflict({ startTime, endTime, dayOfWeek });
            if (hasConflict) {
                conflicts.push('venue');
                // Populate unit for better error message
                const conflictedUnit = await Unit.findById(conflictingLecture.unit).select('code name');
                conflictDetails.push({
                    type: 'venue',
                    message: `Venue ${conflictingLecture.venue.building} ${conflictingLecture.venue.room} is already booked for ${conflictedUnit?.code || 'Unknown Unit'} from ${conflictingLecture.startTime} to ${conflictingLecture.endTime} on ${conflictingLecture.dayName}.`
                });
                break; // Found a conflict, no need to check further for this venue
            }
        }
    }

    // 4. Return results
    if (conflicts.length > 0) {
      return NextResponse.json({
        hasConflicts: true,
        conflicts: conflicts, // e.g., ['teacher', 'venue']
        details: conflictDetails
      }, { status: 400 }); // Use 400 Bad Request to indicate a validation error
    } else {
      return NextResponse.json({ hasConflicts: false, message: 'No conflicts detected' }, { status: 200 });
    }

  } catch (error) {
    console.error('Error checking conflicts:', error);
    return NextResponse.json(
      { error: 'Failed to check conflicts', details: error.message },
      { status: 500 }
    );
  }
}