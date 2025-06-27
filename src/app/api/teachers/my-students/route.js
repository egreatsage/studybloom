import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import TeachingAssignment from '@/models/TeachingAssignment';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all courses the teacher is assigned to
    const teachingAssignments = await TeachingAssignment.find({ teacher: session.user.id }).select('course');
    const courseIds = teachingAssignments.map(assignment => assignment.course);

    // Find all students directly enrolled in those courses via the User model
    const students = await User.find({ role: 'student', course: { $in: courseIds } })
      .select('-password') // Exclude the password field
      .populate('parent', 'name email phoneNumber') // Populate parent details
      .populate('course', 'name code'); // Populate course details

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students for teacher:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}