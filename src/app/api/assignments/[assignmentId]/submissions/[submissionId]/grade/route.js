import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { assignmentId, submissionId } = params;
    const { grade, feedback } = await request.json();

    if (grade === undefined || grade === null) {
      return NextResponse.json({ error: 'Grade is required' }, { status: 400 });
    }

    const assignment = await Assignment.findById(assignmentId).populate({
        path: 'submissions.student',
        model: 'User',
        select: 'name email  photoUrl'
      });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.gradedAt = new Date();

    await assignment.save();

    return NextResponse.json(assignment);
  } catch (error) {
    console.error(`Error grading submission:`, error);
    return NextResponse.json({ error: 'Failed to grade submission' }, { status: 500 });
  }
}
