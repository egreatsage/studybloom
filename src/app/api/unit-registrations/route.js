import { NextResponse } from 'next/server';
import UnitRegistration from '@/models/UnitRegistration';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { RegistrationValidationService } from '@/lib/services/registrationValidation';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const registrations = await UnitRegistration.find({ student: session.user.id })
      .populate('unit')
      .populate('semester');

    return NextResponse.json(registrations);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unitId, semesterId } = await request.json();

    if (!unitId || !semesterId) {
      return NextResponse.json({ error: 'Unit ID and Semester ID are required' }, { status: 400 });
    }

    // Use the validation service
    const validation = await RegistrationValidationService.validateRegistration(
      session.user.id,
      unitId,
      semesterId
    );
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Registration validation failed',
        validationErrors: validation.errors 
      }, { status: 400 });
    }

    const registration = await UnitRegistration.create({
      student: session.user.id,
      unit: unitId,
      semester: semesterId
    });

    const populatedRegistration = await UnitRegistration.findById(registration._id)
      .populate('unit')
      .populate('semester');

    return NextResponse.json(populatedRegistration, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    await connectDB();

    const registration = await UnitRegistration.findById(id);
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.student.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await registration.deleteOne();

    return NextResponse.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
