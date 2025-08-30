import { type UploadImageInput, type UploadImageResponse } from '../schema';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Supported image types
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadImage = async (input: UploadImageInput): Promise<UploadImageResponse> => {
  try {
    // 1. Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(input.content_type.toLowerCase())) {
      throw new Error(`Unsupported file type: ${input.content_type}. Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
    }

    // 2. Validate and decode base64 data
    let buffer: Buffer;
    try {
      buffer = Buffer.from(input.file_data, 'base64');
    } catch (error) {
      throw new Error('Invalid base64 data provided');
    }

    // 3. Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // 4. Generate unique filename
    const fileExtension = getFileExtension(input.content_type);
    const uniqueId = randomUUID();
    const uniqueFilename = `${uniqueId}${fileExtension}`;

    // 5. Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
      if ((error as any).code !== 'EEXIST') {
        throw error;
      }
    }

    // 6. Save file to disk
    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // 7. Return public URL
    const publicUrl = `/uploads/${uniqueFilename}`;

    return {
      url: publicUrl,
      filename: uniqueFilename
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};

// Helper function to get file extension from content type
function getFileExtension(contentType: string): string {
  switch (contentType.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}