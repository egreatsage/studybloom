import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Assignment from '@/models/Assignment';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MODIFIED: This function now correctly handles the file object
const bufferUpload = async (file) => {
  return new Promise(async (resolve, reject) => {
    // Convert file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create an upload stream to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "submissions" },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // Write the buffer to the stream
    uploadStream.end(buffer);
  });
};

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignmentId = params.assignmentId;
    const formData = await request.formData();
    const files = formData.getAll('files');
    const comment = formData.get('comment');

    console.log('Received submission request:', {
      assignmentId,
      filesCount: files.length,
      comment: comment ? 'present' : 'not present'
    });

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for submission.' }, { status: 400 });
    }

    await connectDB();
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

   

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await bufferUpload(file);
        return { url: uploadResult.secure_url, name: file.name };
      })
    );
    
    const existingSubmissionIndex = assignment.submissions.findIndex(
      (sub) => sub.student.toString() === session.user.id
    );

    const newSubmission = {
      student: session.user.id,
      files: uploadedFiles,
      comment: comment,
      submittedAt: new Date(),
    };

    if (existingSubmissionIndex > -1) {
      assignment.submissions[existingSubmissionIndex] = newSubmission;
    } else {
      assignment.submissions.push(newSubmission);
    }

    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('submissions.student', 'name email');

    return NextResponse.json(populatedAssignment, { status: 200 });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 });
  }
}