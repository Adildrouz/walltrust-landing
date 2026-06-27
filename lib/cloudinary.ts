import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a base64 data URI or remote URL to Cloudinary and return the secure URL.
 */
export async function uploadImage(
  dataUri: string,
  folder = "walltrust"
): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ width: 1000, crop: "limit" }, { quality: "auto" }],
  });
  return result.secure_url;
}

export default cloudinary;
