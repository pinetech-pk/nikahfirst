import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Photo constraints - enforced in code since Cloudinary preset doesn't have these settings
export const PHOTO_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ["jpg", "jpeg", "png", "webp"],
  MAX_PHOTOS_PER_PROFILE: 6,
  MIN_DIMENSION: 200, // minimum 200x200 pixels
  MAX_DIMENSION: 4096, // maximum 4096x4096 pixels
};

// Generate blurred URL for non-connected users
export function getBlurredUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    transformation: [
      { effect: "blur:1000" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });
}

// Generate thumbnail URL
export function getThumbnailUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    transformation: [
      { width: 150, height: 150, crop: "fill", gravity: "face" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });
}

// Generate optimized original URL
export function getOptimizedUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    transformation: [
      { width: 800, height: 800, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });
}

// Delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
}

// Validate file before upload (client-side helper)
export function validatePhotoFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > PHOTO_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${PHOTO_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!fileExtension || !PHOTO_CONSTRAINTS.ALLOWED_FORMATS.includes(fileExtension)) {
    return {
      valid: false,
      error: `File must be one of: ${PHOTO_CONSTRAINTS.ALLOWED_FORMATS.join(", ")}`,
    };
  }

  // Check MIME type
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type",
    };
  }

  return { valid: true };
}
