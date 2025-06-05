import { NextResponse } from 'next/server';
import Semester from '@/models/Semester';
import Course from '@/models/Course';
import Unit from '@/models/Unit';
import connectDB from '@/lib/mongodb';


export async function GET(request) {
  await connectDB();
  try {
    const semesters = await Semester.find()
      .populate('courses')
      .populate({
        path: 'units',
        populate: {
          path: 'course',
          select: 'name code'
        }
      });
    return NextResponse.json({ semesters });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const data = await request.json();
    const semester = new Semester(data);
    await semester.save();
    return NextResponse.json({ semester });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  await connectDB();
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const semester = await Semester.findByIdAndUpdate(id, updateData, { new: true });
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }
    return NextResponse.json({ semester });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing semester id' }, { status: 400 });
    }
    const semester = await Semester.findByIdAndDelete(id);
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Semester deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
