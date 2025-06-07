import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Lecture from '@/models/Lecture';
import Timetable from '@/models/Timetable';

// POST /api/lectures/bulk - Bulk create lectures
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { lectures } = await request.json();

    if (!lectures || !Array.isArray(lectures) || lectures.length === 0) {
      return NextResponse.json(
        { error: 'Invalid lectures data' },
        { status: 400 }
      );
    }

    // Validate all lectures belong to the same timetable
    const timetableIds = [...new Set(lectures.map(l => l.timetable))];
    if (timetableIds.length !== 1) {
      return NextResponse.json(
        { error: 'All lectures must belong to the same timetable' },
        { status: 400 }
      );
    }

    // Validate timetable exists and is draft
    const timetable = await Timetable.findById(timetableIds[0]);
    if (!timetable) {
      return NextResponse.json(
        { error: 'Timetable not found' },
        { status: 404 }
      );
    }

    // if (timetable.status !== 'draft') {
    //   return NextResponse.json(
    //     { error: 'Can only add lectures to draft timetables' },
    //     { status: 400 }
    //   );
    // }

    // Validate and create lectures
    const createdLectures = [];
    const errors = [];

    for (let i = 0; i < lectures.length; i++) {
      try {
        const lectureData = lectures[i];
        
        // Check for conflicts within the batch
        for (let j = 0; j < i; j++) {
          const prevLecture = lectures[j];
          if (
            prevLecture.dayOfWeek === lectureData.dayOfWeek &&
            (prevLecture.teacher === lectureData.teacher ||
              (prevLecture.venue.building === lectureData.venue.building &&
                prevLecture.venue.room === lectureData.venue.room))
          ) {
            // Simple time overlap check
            const prevStart = prevLecture.startTime.split(':').map(Number);
            const prevEnd = prevLecture.endTime.split(':').map(Number);
            const currStart = lectureData.startTime.split(':').map(Number);
            const currEnd = lectureData.endTime.split(':').map(Number);
            
            const prevStartMin = prevStart[0] * 60 + prevStart[1];
            const prevEndMin = prevEnd[0] * 60 + prevEnd[1];
            const currStartMin = currStart[0] * 60 + currStart[1];
            const currEndMin = currEnd[0] * 60 + currEnd[1];
            
            if (currStartMin < prevEndMin && currEndMin > prevStartMin) {
              throw new Error(
                prevLecture.teacher === lectureData.teacher
                  ? 'Teacher time conflict within batch'
                  : 'Venue time conflict within batch'
              );
            }
          }
        }

        const lecture = await Lecture.create(lectureData);
        await lecture.populate([
          { path: 'unit', select: 'name code' },
          { path: 'teacher', select: 'name email' }
        ]);
        
        createdLectures.push(lecture);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
          lecture: lectures[i]
        });
      }
    }

    return NextResponse.json({
      success: createdLectures.length,
      failed: errors.length,
      createdLectures,
      errors
    }, { status: errors.length > 0 ? 207 : 201 }); // 207 Multi-Status
  } catch (error) {
    console.error('Error bulk creating lectures:', error);
    return NextResponse.json(
      { error: 'Failed to bulk create lectures' },
      { status: 500 }
    );
  }
}
