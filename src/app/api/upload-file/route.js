import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload a file buffer to Cloudinary
const bufferUpload = async (file) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    file.stream().on('data', (chunk) => {
      chunks.push(chunk);
    });
    file.stream().on('end', () => {
      const buffer = Buffer.concat(chunks);
      cloudinary.uploader.upload_stream(
        {
          // FIX: Use "auto" to let Cloudinary handle the file type
          resource_type: "auto",
          // FIX: Use a more appropriate folder for assignment files
          folder: "assignments", 
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      ).end(buffer);
    });
    file.stream().on('error', (error) => {
        reject(error);
    });
  });
};


export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const uploadResult = await bufferUpload(file);
    
    // Return the secure URL from the result
    return NextResponse.json({ imageUrl: uploadResult.secure_url });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}