import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import TeachingAssignment from '@/models/TeachingAssignment';
import Lecture from '@/models/Lecture';
import Assignment from '@/models/Assignment';
import Unit from '@/models/Unit';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const teacherId = session.user.id;

    // Get teacher's active assignments
    const teachingAssignments = await TeachingAssignment.find({ teacher: teacherId })
      .populate('course', 'name code')
      .populate('units.unit', 'name code');

    const courseIds = teachingAssignments.map(ta => ta.course._id);
    const unitIds = teachingAssignments.flatMap(ta => ta.units.map(u => u.unit._id));
    
    // --- Key Metrics ---
    
    // 1. Upcoming Schedule for Today
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1
    
    const todaysLectures = await Lecture.find({
      teacher: teacherId,
      dayOfWeek: dayOfWeek
    }).populate('unit', 'name code').sort({ startTime: 1 });

    // 2. Upcoming Assignment Deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingAssignments = await Assignment.find({
      unit: { $in: unitIds },
      dueDate: { $gte: today, $lte: nextWeek }
    }).populate('unit', 'name code').sort({ dueDate: 1 });
    
    // 3. Overall stats
    const totalCourses = courseIds.length;
    const totalUnits = unitIds.length;
    
    // Note: A more complex aggregation would be needed for a precise student count.
    // This is a simplified version.
    const courseStudentCounts = await Promise.all(courseIds.map(async id => {
        const enrollments = (await (await import('@/models/Enrollment')).default).find({ course: id }).countDocuments();
        return enrollments;
    }));
    const totalStudents = courseStudentCounts.reduce((a, b) => a + b, 0);


    return NextResponse.json({
      summary: {
        totalCourses,
        totalUnits,
        totalStudents,
        upcomingAssignmentsCount: upcomingAssignments.length,
      },
      todaysLectures,
      upcomingAssignments,
      courses: teachingAssignments.map(ta => ({
          ...ta.course.toObject(),
          units: ta.units.map(u => u.unit)
      }))
    });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}