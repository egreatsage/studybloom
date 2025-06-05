import { NextResponse } from 'next/server';
import Semester from '@/models/Semester';
import Unit from '@/models/Unit';
import connectDB from '@/lib/mongodb';

export async function GET(request, context) {
  await connectDB();
  try {
    const { semesterId } = await context.params;
    const semester = await Semester.findById(semesterId)
      .populate('courses')
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
    return NextResponse.json({ semester });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  await connectDB();
  try {
    const { semesterId } = await context.params;
    const body = await request.json();
    
    const semester = await Semester.findByIdAndUpdate(
      semesterId,
      body,
      { new: true, runValidators: true }
    ).populate('courses');
    
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }
    
    return NextResponse.json({ semester });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  await connectDB();
  try {
    const { semesterId } = await context.params;
    
    const semester = await Semester.findByIdAndDelete(semesterId);
    
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Semester deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
