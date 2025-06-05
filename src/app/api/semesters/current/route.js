import { NextResponse } from 'next/server';
import Semester from '@/models/Semester';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    
    // Find the current active semester
    const currentSemester = await Semester.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('courses', 'name code');

    if (!currentSemester) {
      // If no active semester, find the next upcoming semester
      const upcomingSemester = await Semester.findOne({
        startDate: { $gt: now }
      }).sort({ startDate: 1 }).populate('courses', 'name code');

      return NextResponse.json({
        current: null,
        upcoming: upcomingSemester,
        message: 'No active semester found'
      });
    }

    // Calculate days remaining in the semester
    const daysRemaining = Math.ceil((currentSemester.endDate - now) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      ...currentSemester.toObject(),
      isActive: true,
      daysRemaining
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
