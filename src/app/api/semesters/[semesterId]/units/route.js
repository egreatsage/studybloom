import { NextResponse } from 'next/server';
import Semester from '@/models/Semester';
import Unit from '@/models/Unit';
import connectDB from '@/lib/mongodb';

export async function GET(request, context) {
  await connectDB();
  try {
    const { semesterId } = await context.params;
    
    const semester = await Semester.findById(semesterId)
      .populate({
        path: 'units',
        populate: {
          path: 'course',
          select: 'name code'
        }
      });
      
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }

    return NextResponse.json({ units: semester.units });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  await connectDB();
  try {
    const { semesterId } = await context.params;
    const { unitIds } = await request.json();

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }

    // Verify all units exist
    const units = await Unit.find({ _id: { $in: unitIds } });
    if (units.length !== unitIds.length) {
      return NextResponse.json({ error: 'Some units not found' }, { status: 400 });
    }

    // Add units to semester if not already present
    unitIds.forEach((unitId) => {
      if (!semester.units.includes(unitId)) {
        semester.units.push(unitId);
      }
    });

    await semester.save();
    await semester.populate({
      path: 'units',
      populate: {
        path: 'course',
        select: 'name code'
      }
    });

    return NextResponse.json({ semester });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  await connectDB();
  try {
    const { semesterId } = await context.params;
    const { unitIds } = await request.json();

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }

    // Remove units from semester
    semester.units = semester.units.filter(
      (unitId) => !unitIds.includes(unitId.toString())
    );

    await semester.save();
    await semester.populate({
      path: 'units',
      populate: {
        path: 'course',
        select: 'name code'
      }
    });

    return NextResponse.json({ semester });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
