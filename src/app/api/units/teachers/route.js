import { NextResponse } from 'next/server';
import TeachingAssignment from '@/models/TeachingAssignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['parent', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const unitIds = searchParams.get('unitIds')?.split(',');

    if (!unitIds || unitIds.length === 0) {
      return NextResponse.json({ error: 'Unit IDs are required' }, { status: 400 });
    }

    // Find active teaching assignments for the specified units
    const assignments = await TeachingAssignment.find({
      'units': {
        $elemMatch: {
          'unit': { $in: unitIds },
          'isActive': true
        }
      }
    })
    .populate('teacher', 'name email phoneNumber')
    .populate('units.unit', 'name code');

    // Create a map of unit ID to teacher info
    const unitTeacherMap = {};
    assignments.forEach(assignment => {
      assignment.units.forEach(unit => {
        if (unit.isActive && unitIds.includes(unit.unit._id.toString())) {
          unitTeacherMap[unit.unit._id.toString()] = {
            unitId: unit.unit._id,
            unitCode: unit.unit.code,
            unitName: unit.unit.name,
            teacher: {
              id: assignment.teacher._id,
              name: assignment.teacher.name,
              email: assignment.teacher.email,
              phoneNumber: assignment.teacher.phoneNumber
            }
          };
        }
      });
    });

    return NextResponse.json(unitTeacherMap);
  } catch (error) {
    console.error('Error fetching unit teachers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
