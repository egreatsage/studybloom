import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/User'; // Ensure User model is imported for population
import Unit from '@/models/Unit'; // Ensure Unit model is imported for population
import Course from '@/models/Course'; // Ensure Course model is imported for population


export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;

    const assignment = await Assignment.findById(id)
      .populate('unit', 'name code')
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .populate({
        path: 'submissions.student',
        model: 'User',
        select: 'name email photoUrl'
      });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    // Optional: Add teacher authorization check
    if (session.user.role === 'teacher' && assignment.createdBy.toString() !== session.user.id) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json({ error: 'Failed to fetch assignment' }, { status: 500 });
  }
}