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

/**
 * Append Cloudinary delivery transforms to a stored secure_url.
 * Non-Cloudinary URLs are returned unchanged.
 *
 * @param {string | undefined | null} url
 * @param {string} [transformation="w_1200,c_limit,q_auto"]
 * @returns {string}
 */
export function getCloudinaryImageUrl(url, transformation = "w_1200,c_limit,q_auto") {
  if (!url || typeof url !== "string") return url ?? "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const marker = "/image/upload/";
  const baseIndex = url.indexOf(marker);
  const prefix = url.slice(0, baseIndex + marker.length);
  const rest = url.slice(baseIndex + marker.length);

  const firstSegment = rest.split("/")[0];
  if (firstSegment.includes(",") || /^(w_|h_|c_|q_|f_|g_)/.test(firstSegment)) {
    return url;
  }

  return `${prefix}${transformation}/${rest}`;
}

/**
 * @param {string | undefined | null} publicId
 */
export async function deleteCloudinaryImage(publicId) {
  if (!publicId) return;

  try {
    await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    });
  } catch {
    /* image may remain in Cloudinary; record is already gone */
  }
}
