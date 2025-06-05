import { NextResponse } from 'next/server';
import Unit from '@/models/Unit';
import User from '@/models/User';
import Semester from '@/models/Semester';
import UnitRegistration from '@/models/UnitRegistration';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');

    if (!semesterId) {
      return NextResponse.json({ error: 'Semester ID is required' }, { status: 400 });
    }

    await connectDB();

    // Get the student's course
    const student = await User.findById(session.user.id).select('course');
    if (!student.course) {
      return NextResponse.json({ error: 'Student is not enrolled in any course' }, { status: 400 });
    }

    // Get semester with registration info
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }

    // Get units for the course in this semester with prerequisites
    const units = await Unit.find({
      course: student.course,
      _id: { $in: semester.units }
    }).populate('prerequisites');

    // Get student's registrations
    const registrations = await UnitRegistration.find({
      student: session.user.id,
      semester: semesterId
    });

    const registeredUnitIds = registrations
      .filter(reg => reg.status !== 'dropped')
      .map(reg => reg.unit.toString());

    // Get completed units for prerequisite checking
    const completedRegistrations = await UnitRegistration.find({
      student: session.user.id,
      status: 'completed',
      grade: { $gte: 50 }
    });

    const completedUnitIds = completedRegistrations.map(reg => reg.unit.toString());

    // Get enrollment counts for each unit
    const enrollmentCounts = await UnitRegistration.aggregate([
      {
        $match: {
          semester: new mongoose.Types.ObjectId(semesterId),
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$unit',
          count: { $sum: 1 }
        }
      }
    ]);

    const enrollmentMap = enrollmentCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    // Process units with additional info
    const processedUnits = units.map(unit => {
      const enrolledCount = enrollmentMap[unit._id.toString()] || 0;
      const isRegistered = registeredUnitIds.includes(unit._id.toString());
      const isFull = unit.capacity && enrolledCount >= unit.capacity;
      
      // Check prerequisites
      const hasPrerequisites = unit.prerequisites && unit.prerequisites.length > 0;
      const prerequisitesMet = !hasPrerequisites || 
        unit.prerequisites.every(prereq => completedUnitIds.includes(prereq._id.toString()));

      return {
        ...unit.toObject(),
        enrolledCount,
        availableSlots: unit.capacity ? Math.max(0, unit.capacity - enrolledCount) : null,
        isRegistered,
        isFull,
        hasPrerequisites,
        prerequisitesMet,
        canRegister: !isRegistered && !isFull && prerequisitesMet && semester.isRegistrationOpen
      };
    });

    // Get current registration count
    const activeRegistrationCount = registrations.filter(reg => reg.status === 'active').length;

    return NextResponse.json({
      units: processedUnits,
      registrationInfo: {
        currentCount: activeRegistrationCount,
        maxAllowed: semester.maxUnitsPerStudent,
        canRegisterMore: activeRegistrationCount < semester.maxUnitsPerStudent,
        registrationOpen: semester.isRegistrationOpen,
        registrationStartDate: semester.registrationStartDate,
        registrationEndDate: semester.registrationEndDate,
        daysRemaining: semester.registrationDaysRemaining
      },
      semester: {
        ...semester.toObject(),
        isActive: semester.isActive
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
