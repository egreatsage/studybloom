import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Venue from '@/models/Venue';
import Lecture from '@/models/Lecture';

// GET /api/venues/availability - Check venue availability
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const capacity = searchParams.get('capacity');
    const type = searchParams.get('type');
    const timetableId = searchParams.get('timetableId');

    // Validate required parameters
    if (!dayOfWeek || !startTime || !endTime || !timetableId) {
      return NextResponse.json(
        { error: 'dayOfWeek, startTime, endTime, and timetableId are required' },
        { status: 400 }
      );
    }

    // Get all venues that meet the criteria
    const venueQuery = { isActive: true };
    if (capacity) venueQuery.capacity = { $gte: parseInt(capacity) };
    if (type) venueQuery.type = type;

    let venues = await Venue.find(venueQuery).sort({ building: 1, room: 1 });

    // If a specific date is provided, filter out venues under maintenance
    if (date) {
      const checkDate = new Date(date);
      venues = venues.filter(venue => venue.isAvailableOn(checkDate));
    }

    // Get all lectures for the specified day and time in the timetable
    const lectures = await Lecture.find({
      timetable: timetableId,
      dayOfWeek: parseInt(dayOfWeek)
    });

    // Check availability for each venue
    const availableVenues = [];
    const occupiedVenues = [];

    for (const venue of venues) {
      let isAvailable = true;
      let conflictingLecture = null;

      // Check if venue is occupied at the specified time
      for (const lecture of lectures) {
        if (
          lecture.venue.building === venue.building &&
          lecture.venue.room === venue.room
        ) {
          // Check time overlap
          const lectureStart = lecture.startTime.split(':').map(Number);
          const lectureEnd = lecture.endTime.split(':').map(Number);
          const requestStart = startTime.split(':').map(Number);
          const requestEnd = endTime.split(':').map(Number);

          const lectureStartMin = lectureStart[0] * 60 + lectureStart[1];
          const lectureEndMin = lectureEnd[0] * 60 + lectureEnd[1];
          const requestStartMin = requestStart[0] * 60 + requestStart[1];
          const requestEndMin = requestEnd[0] * 60 + requestEnd[1];

          if (requestStartMin < lectureEndMin && requestEndMin > lectureStartMin) {
            isAvailable = false;
            conflictingLecture = {
              unit: lecture.unit,
              teacher: lecture.teacher,
              startTime: lecture.startTime,
              endTime: lecture.endTime
            };
            break;
          }
        }
      }

      if (isAvailable) {
        availableVenues.push({
          ...venue.toObject(),
          status: 'available'
        });
      } else {
        occupiedVenues.push({
          ...venue.toObject(),
          status: 'occupied',
          conflict: conflictingLecture
        });
      }
    }

    // Populate lecture references for occupied venues
    if (occupiedVenues.length > 0) {
      await Lecture.populate(occupiedVenues, [
        { path: 'conflict.unit', select: 'name code' },
        { path: 'conflict.teacher', select: 'name' }
      ]);
    }

    return NextResponse.json({
      available: availableVenues,
      occupied: occupiedVenues,
      summary: {
        totalVenues: venues.length,
        availableCount: availableVenues.length,
        occupiedCount: occupiedVenues.length
      }
    });
  } catch (error) {
    console.error('Error checking venue availability:', error);
    return NextResponse.json(
      { error: 'Failed to check venue availability' },
      { status: 500 }
    );
  }
}
