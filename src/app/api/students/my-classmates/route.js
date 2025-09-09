import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UnitRegistration from '@/models/UnitRegistration';
import Semester from '@/models/Semester';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find the current active semester
    const now = new Date();
    const currentSemester = await Semester.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!currentSemester) {
      return NextResponse.json([]); // No active semester, so no classmates
    }

    // Find the units the current student is registered for in the active semester
    const studentRegistrations = await UnitRegistration.find({
      student: session.user.id,
      semester: currentSemester._id,
      status: 'active'
    }).select('unit');

    const registeredUnitIds = studentRegistrations.map(reg => reg.unit);

    if (registeredUnitIds.length === 0) {
      return NextResponse.json([]); // Not registered for any units
    }

    // Find all registrations for those units in the same semester
    const allClassmateRegistrations = await UnitRegistration.find({
      unit: { $in: registeredUnitIds },
      semester: currentSemester._id,
      status: 'active',
      student: { $ne: session.user.id } // Exclude the current student
    }).select('student');

    // Get a unique list of classmate IDs
    const classmateIds = [...new Set(allClassmateRegistrations.map(reg => reg.student))];

    // Fetch the details of the classmates
    const classmates = await User.find({
      _id: { $in: classmateIds }
    }).select('name email photoUrl regNumber');

    return NextResponse.json(classmates);

  } catch (error) {
    console.error('Error fetching classmates:', error);
    return NextResponse.json({ error: 'Failed to fetch classmates' }, { status: 500 });
  }
}