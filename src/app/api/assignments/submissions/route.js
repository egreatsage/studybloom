import { NextResponse } from 'next/server';
import Assignment from '@/models/Assignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assignmentId, fileUrl } = body;

    if (!assignmentId || !fileUrl) {
      return NextResponse.json(
        { error: 'Assignment ID and file URL are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if student has already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === session.user.id
    );

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.fileUrl = fileUrl;
      existingSubmission.submittedAt = new Date();
    } else {
      // Add new submission
      assignment.submissions.push({
        student: session.user.id,
        fileUrl,
        submittedAt: new Date()
      });
    }

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate('course', 'name code description')
      .populate('unit', 'name code')
      .populate('submissions.student', 'name email');

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assignmentId, studentId, grade, feedback } = body;

    if (!assignmentId || !studentId || !grade) {
      return NextResponse.json(
        { error: 'Assignment ID, student ID, and grade are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Find the submission for the student
    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update grade and feedback
    submission.grade = grade;
    if (feedback) {
      submission.feedback = feedback;
    }
    submission.gradedAt = new Date();
    submission.gradedBy = session.user.id;

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate('course', 'name code description')
      .populate('unit', 'name code')
      .populate('submissions.student', 'name email')
      .populate('submissions.gradedBy', 'name email');

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const assignment = await Assignment.findById(assignmentId)
      .populate('course', 'name code description')
      .populate('unit', 'name code')
      .populate('submissions.student', 'name email')
      .populate('submissions.gradedBy', 'name email');

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Filter submissions based on user role and access rights
    if (session.user.role === 'student') {
      // Students can only see their own submissions
      assignment.submissions = assignment.submissions.filter(
        sub => sub.student._id.toString() === session.user.id
      );
    } else if (session.user.role === 'teacher') {
      // Teachers can see all submissions for their courses
      if (assignment.createdBy.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    // Admins can see all submissions

    if (studentId) {
      // If studentId is provided, filter for specific student
      assignment.submissions = assignment.submissions.filter(
        sub => sub.student._id.toString() === studentId
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
