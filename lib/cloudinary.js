/** Cloud name and unsigned upload preset (configure preset as "Unsigned" in Cloudinary). */
export const CLOUDINARY_CLOUD_NAME = "drpmjj0to";
export const CLOUDINARY_UPLOAD_PRESET = "herbarium_preset";

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * @param {File} file
 * @returns {Promise<{ secureUrl: string; publicId: string }>}
 */
export async function uploadImageToCloudinary(file) {
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(UPLOAD_URL, { method: "POST", body });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || res.statusText || "Upload failed";
    throw new Error(msg);
  }
  if (!data.secure_url || !data.public_id) {
    throw new Error("No image URL or public_id returned from Cloudinary.");
  }
  return { secureUrl: data.secure_url, publicId: data.public_id };
}
