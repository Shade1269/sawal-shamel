/**
 * ✅ Secure File Upload Validation
 * Validates files using multiple layers of security:
 * 1. File extension whitelist
 * 2. MIME type validation
 * 3. Magic bytes (file signature) validation
 * 4. File size limits
 */

// Allowed image extensions
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Magic bytes (file signatures) for common image types
const MAGIC_BYTES: Record<string, number[][]> = {
  jpg: [[0xFF, 0xD8, 0xFF]],
  jpeg: [[0xFF, 0xD8, 0xFF]],
  png: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  gif: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]], // GIF87a or GIF89a
  webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP starts with RIFF)
  svg: [[0x3C, 0x3F, 0x78, 0x6D, 0x6C], [0x3C, 0x73, 0x76, 0x67]], // <?xml or <svg
};

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Check if file signature matches expected magic bytes
 */
async function validateMagicBytes(file: File, extension: string): Promise<boolean> {
  try {
    const expectedSignatures = MAGIC_BYTES[extension.toLowerCase()];
    if (!expectedSignatures) {
      // If no magic bytes defined, skip this validation
      return true;
    }

    // Read first 16 bytes of file
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check if any of the expected signatures match
    return expectedSignatures.some(signature => {
      if (signature.length > bytes.length) return false;

      for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !== signature[i]) return false;
      }

      return true;
    });
  } catch (error) {
    console.error('Magic bytes validation error:', error);
    return false;
  }
}

/**
 * Validate image file comprehensively
 * @param file - File object to validate
 * @param options - Optional configuration
 * @returns ValidationResult
 */
export async function validateImageFile(
  file: File,
  options?: {
    maxSize?: number;
    allowedExtensions?: string[];
  }
): Promise<ValidationResult> {
  const maxSize = options?.maxSize || MAX_FILE_SIZE;
  const allowedExtensions = options?.allowedExtensions || ALLOWED_IMAGE_EXTENSIONS;

  // 1. Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `حجم الملف كبير جداً. الحد الأقصى ${maxSize / 1024 / 1024}MB`,
    };
  }

  // 2. Check file extension
  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop();

  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `نوع الملف غير مسموح. الأنواع المسموحة: ${allowedExtensions.join(', ')}`,
    };
  }

  // 3. Check MIME type
  const mimeType = file.type.toLowerCase();
  if (!mimeType.startsWith('image/')) {
    return {
      valid: false,
      error: 'الملف ليس صورة صالحة',
    };
  }

  // 4. Validate magic bytes (file signature)
  const magicBytesValid = await validateMagicBytes(file, extension);
  if (!magicBytesValid) {
    return {
      valid: false,
      error: 'محتوى الملف لا يطابق الامتداد المعلن',
    };
  }

  // All checks passed
  return { valid: true };
}

/**
 * Validate multiple files
 */
export async function validateImageFiles(
  files: File[],
  options?: {
    maxSize?: number;
    allowedExtensions?: string[];
  }
): Promise<ValidationResult> {
  for (const file of files) {
    const result = await validateImageFile(file, options);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string | null {
  const extension = filename.toLowerCase().split('.').pop();
  return extension || null;
}

/**
 * Check if extension is allowed
 */
export function isAllowedExtension(filename: string, allowedExtensions: string[] = ALLOWED_IMAGE_EXTENSIONS): boolean {
  const extension = getFileExtension(filename);
  return extension ? allowedExtensions.includes(extension) : false;
}
