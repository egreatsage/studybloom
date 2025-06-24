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
    const { assignmentId, submissionId } = await params;
    const { grade, feedback } = await request.json();

    const parsedGrade = parseFloat(grade);
    if (isNaN(parsedGrade)) {
        return NextResponse.json({ error: 'Invalid grade format.' }, { status: 400 });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // --- NEW VALIDATION LOGIC ---
    if (parsedGrade > assignment.maxScore) {
      return NextResponse.json(
        { error: `Grade (${parsedGrade}) cannot exceed the maximum score of ${assignment.maxScore}.` },
        { status: 400 }
      );
    }
    // --- END NEW VALIDATION LOGIC ---

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    submission.grade = parsedGrade;
    submission.feedback = feedback || '';
    submission.gradedAt = new Date();
    submission.gradedBy = session.user.id;

    await assignment.save();
    
    // Repopulate after saving
    const updatedAssignment = await Assignment.findById(assignmentId).populate({
        path: 'submissions.student',
        model: 'User',
        select: 'name email photoUrl'
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error(`Error grading submission:`, error);
    return NextResponse.json({ error: 'Failed to grade submission' }, { status: 500 });
  }
}