import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Same PLAYWRIGHT_TEST gate as lib/resend.ts and lib/rate-limit.ts — a real
// upload would leave live assets in the project's Cloudinary account on
// every e2e run. The mocked URL uses the real res.cloudinary.com host so
// it still passes next.config.mjs's image remotePatterns/CSP allowlist.
const TEST_MODE = process.env.PLAYWRIGHT_TEST === "1";

/**
 * Upload a base64 data URI or remote URL to Cloudinary and return the secure URL.
 */
export async function uploadImage(
  dataUri: string,
  folder = "walltrust"
): Promise<string> {
  if (TEST_MODE) {
    const hash = crypto.createHash("sha1").update(dataUri).digest("hex").slice(0, 12);
    return `https://res.cloudinary.com/test-mode/image/upload/v1/${folder}/${hash}.jpg`;
  }
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ width: 1000, crop: "limit" }, { quality: "auto" }],
  });
  return result.secure_url;
}

export default cloudinary;
