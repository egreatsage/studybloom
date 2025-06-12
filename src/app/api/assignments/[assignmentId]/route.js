import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import TeachingAssignment from '@/models/TeachingAssignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/User';
import Unit from '@/models/Unit';
import Course from '@/models/Course';

export const runtime = 'nodejs';

// The 'params' object will now contain 'assignmentId' instead of 'id'
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { assignmentId } = params; // Use the new, consistent parameter name

    const assignment = await Assignment.findById(assignmentId) // Use it here
      .populate({
        path: 'unit',
        select: 'name code course'
      })
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .populate({
        path: 'submissions.student',
        model: 'User',
        select: 'name email  photoUrl'
      });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    if (session.user.role === 'teacher') {
      const isCreator = assignment.createdBy?._id.toString() === session.user.id;

      if (!isCreator) {
        if (!assignment.unit || !assignment.unit.course) {
          console.error(`Data integrity issue: Assignment ${assignmentId} has a missing or invalid unit/course reference.`);
          return NextResponse.json({ error: 'Forbidden due to inconsistent assignment data.' }, { status: 403 });
        }

        const teachingAssignment = await TeachingAssignment.findOne({
            teacher: session.user.id,
            course: assignment.unit.course,
            units: { $elemMatch: { unit: assignment.unit._id, isActive: true } }
        });

        if (!teachingAssignment) {
            return NextResponse.json({ error: 'Forbidden: You are not assigned to teach this unit.' }, { status: 403 });
        }
      }
    }
    
    return NextResponse.json(assignment);
  } catch (error) {
    console.error(`Error fetching assignment [${params.assignmentId}]:`, error);
    if (error instanceof TypeError) {
        return NextResponse.json({ error: `A server-side TypeError occurred: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch assignment due to a server error.' }, { status: 500 });
  }
}