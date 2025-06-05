import { NextResponse } from 'next/server';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const users = await User.find({})
      .select('-password')
      .populate('course', 'name code');
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');
    const phoneNumber = formData.get('phoneNumber');
    const photo = formData.get('photo');
    const regNumber = formData.get('regNumber');
    const courseId = formData.get('courseId');

    if (!name || !email || !password || !role || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if course is required for the role
    if ((role === 'teacher' || role === 'student') && !courseId) {
      return NextResponse.json(
        { error: 'Course is required for teachers and students' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user - password will be hashed by pre-save hook
    const userData = {
      name,
      email,
      password,
      role,
      phoneNumber,
      ...(formData.get('photoUrl') && { photoUrl: formData.get('photoUrl') }),
      ...(role === 'student' && regNumber && { regNumber }),
      ...((role === 'teacher' || role === 'student') && courseId && { course: courseId })
    };

    const user = await User.create(userData);

    // Populate the course field if the user has one
    if (user.course) {
      await user.populate('course', 'name code');
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const role = formData.get('role');
    const phoneNumber = formData.get('phoneNumber');
    const password = formData.get('password');
    const photo = formData.get('photo');
    const regNumber = formData.get('regNumber');
    const courseId = formData.get('courseId');

    await connectDB();

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is being changed and if new email already exists
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Update photoUrl if provided
    const photoUrl = formData.get('photoUrl');
    if (photoUrl) {
      user.photoUrl = photoUrl;
    }

    // Check if course is required for the new role
    if ((role === 'teacher' || role === 'student') && !courseId && !user.course) {
      return NextResponse.json(
        { error: 'Course is required for teachers and students' },
        { status: 400 }
      );
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    if (role === 'student') {
      user.regNumber = regNumber || user.regNumber;
    }
    if (role === 'teacher' || role === 'student') {
      user.course = courseId || user.course;
    } else if (role === 'admin') {
      // Remove course for admin users
      user.course = undefined;
    }
    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }

    await user.save();

    // Populate the course field
    await user.populate('course', 'name code');

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
