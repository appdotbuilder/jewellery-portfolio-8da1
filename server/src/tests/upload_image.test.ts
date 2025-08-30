import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type UploadImageInput } from '../schema';
import { uploadImage } from '../handlers/upload_image';
import { existsSync, rmSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

// Create a small test image in base64 format (1x1 pixel PNG)
const SMALL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// Create a small test JPEG in base64 format (1x1 pixel JPEG)
const SMALL_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==';

// Create a small test WebP in base64 format (1x1 pixel WebP)
const SMALL_WEBP_BASE64 = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3agAA=';

const testInput: UploadImageInput = {
  filename: 'test-image.png',
  content_type: 'image/png',
  file_data: SMALL_PNG_BASE64
};

describe('uploadImage', () => {
  beforeEach(createDB);
  afterEach(async () => {
    await resetDB();
    // Clean up test files
    const publicDir = path.join(process.cwd(), 'public');
    if (existsSync(publicDir)) {
      rmSync(publicDir, { recursive: true, force: true });
    }
  });

  it('should upload a PNG image successfully', async () => {
    const result = await uploadImage(testInput);

    expect(result.url).toMatch(/^\/uploads\/[a-f0-9-]+\.png$/);
    expect(result.filename).toMatch(/^[a-f0-9-]+\.png$/);
    expect(result.filename).not.toEqual('test-image.png'); // Should be unique

    // Verify file was actually saved
    const filePath = path.join(process.cwd(), 'public', result.url);
    expect(existsSync(filePath)).toBe(true);

    // Verify file content matches
    const savedFile = await readFile(filePath);
    const originalBuffer = Buffer.from(SMALL_PNG_BASE64, 'base64');
    expect(savedFile.equals(originalBuffer)).toBe(true);
  });

  it('should upload a JPEG image successfully', async () => {
    const jpegInput: UploadImageInput = {
      filename: 'test-image.jpg',
      content_type: 'image/jpeg',
      file_data: SMALL_JPEG_BASE64
    };

    const result = await uploadImage(jpegInput);

    expect(result.url).toMatch(/^\/uploads\/[a-f0-9-]+\.jpg$/);
    expect(result.filename).toMatch(/^[a-f0-9-]+\.jpg$/);

    // Verify file exists
    const filePath = path.join(process.cwd(), 'public', result.url);
    expect(existsSync(filePath)).toBe(true);
  });

  it('should upload a WebP image successfully', async () => {
    const webpInput: UploadImageInput = {
      filename: 'test-image.webp',
      content_type: 'image/webp',
      file_data: SMALL_WEBP_BASE64
    };

    const result = await uploadImage(webpInput);

    expect(result.url).toMatch(/^\/uploads\/[a-f0-9-]+\.webp$/);
    expect(result.filename).toMatch(/^[a-f0-9-]+\.webp$/);

    // Verify file exists
    const filePath = path.join(process.cwd(), 'public', result.url);
    expect(existsSync(filePath)).toBe(true);
  });

  it('should handle image/jpg content type (alternative JPEG)', async () => {
    const jpgInput: UploadImageInput = {
      filename: 'test-image.jpg',
      content_type: 'image/jpg',
      file_data: SMALL_JPEG_BASE64
    };

    const result = await uploadImage(jpgInput);

    expect(result.url).toMatch(/^\/uploads\/[a-f0-9-]+\.jpg$/);
    expect(result.filename).toMatch(/^[a-f0-9-]+\.jpg$/);
  });

  it('should generate unique filenames for multiple uploads', async () => {
    const result1 = await uploadImage(testInput);
    const result2 = await uploadImage(testInput);

    expect(result1.filename).not.toEqual(result2.filename);
    expect(result1.url).not.toEqual(result2.url);

    // Both files should exist
    const filePath1 = path.join(process.cwd(), 'public', result1.url);
    const filePath2 = path.join(process.cwd(), 'public', result2.url);
    expect(existsSync(filePath1)).toBe(true);
    expect(existsSync(filePath2)).toBe(true);
  });

  it('should create upload directory if it does not exist', async () => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const publicDir = path.join(process.cwd(), 'public');
    
    // Ensure directories don't exist initially
    if (existsSync(uploadDir)) {
      rmSync(uploadDir, { recursive: true, force: true });
    }
    if (existsSync(publicDir)) {
      rmSync(publicDir, { recursive: true, force: true });
    }
    expect(existsSync(uploadDir)).toBe(false);

    const result = await uploadImage(testInput);

    // Directory should be created and file should exist
    expect(existsSync(uploadDir)).toBe(true);
    const filePath = path.join(process.cwd(), 'public', result.url);
    expect(existsSync(filePath)).toBe(true);
  });

  it('should reject unsupported file types', async () => {
    const invalidInput: UploadImageInput = {
      filename: 'test-document.pdf',
      content_type: 'application/pdf',
      file_data: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovTGVuZ3===' // PDF header
    };

    await expect(uploadImage(invalidInput)).rejects.toThrow(/unsupported file type/i);
  });

  it('should handle case-insensitive content types', async () => {
    const uppercaseInput: UploadImageInput = {
      filename: 'test-image.png',
      content_type: 'IMAGE/PNG',
      file_data: SMALL_PNG_BASE64
    };

    const result = await uploadImage(uppercaseInput);
    expect(result.url).toMatch(/^\/uploads\/[a-f0-9-]+\.png$/);
  });

  it('should reject files that exceed maximum size', async () => {
    // Create a large base64 string (over 5MB when decoded)
    const largeData = 'A'.repeat(7 * 1024 * 1024); // 7MB of 'A' characters
    
    const largeInput: UploadImageInput = {
      filename: 'large-image.png',
      content_type: 'image/png',
      file_data: largeData
    };

    await expect(uploadImage(largeInput)).rejects.toThrow(/file size exceeds maximum limit/i);
  });

  it('should handle empty file data', async () => {
    const emptyInput: UploadImageInput = {
      filename: 'test-image.png',
      content_type: 'image/png',
      file_data: ''
    };

    // Empty file data should result in 0-byte file, which might be handled differently
    // Let's test that this works or throws an appropriate error
    const result = await uploadImage(emptyInput);
    expect(result.url).toMatch(/^\/uploads\/[a-f0-9-]+\.png$/);
    
    // Verify empty file was created
    const filePath = path.join(process.cwd(), 'public', result.url);
    expect(existsSync(filePath)).toBe(true);
    
    const savedFile = await readFile(filePath);
    expect(savedFile.length).toBe(0);
  });

  it('should return correct file extension based on content type', async () => {
    const testCases = [
      { contentType: 'image/png', expectedExt: '.png' },
      { contentType: 'image/jpeg', expectedExt: '.jpg' },
      { contentType: 'image/jpg', expectedExt: '.jpg' },
      { contentType: 'image/webp', expectedExt: '.webp' }
    ];

    for (const testCase of testCases) {
      const input: UploadImageInput = {
        filename: 'test-image',
        content_type: testCase.contentType,
        file_data: SMALL_PNG_BASE64 // Use small valid data for all
      };

      const result = await uploadImage(input);
      expect(result.filename).toEndWith(testCase.expectedExt);
      expect(result.url).toEndWith(testCase.expectedExt);
    }
  });
});