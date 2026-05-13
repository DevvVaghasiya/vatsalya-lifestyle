/**
 * cloudinary.js
 * Uploads an image File/Blob to Cloudinary using an unsigned upload preset.
 * Returns the secure HTTPS URL of the uploaded image.
 *
 * Setup (free account at cloudinary.com):
 *   1. Create a free Cloudinary account.
 *   2. In Settings → Upload, create an "Unsigned" upload preset.
 *   3. Fill in CLOUD_NAME and UPLOAD_PRESET below.
 */

const CLOUD_NAME   = 'da0kbcwzw';     // Cloudinary cloud name
const UPLOAD_PRESET = 'vatsalya_dp';   // Unsigned upload preset

/**
 * @param {File} file  - The image file selected by the user
 * @returns {Promise<string>}  - Resolves to the secure Cloudinary image URL
 */
export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'profile_pictures');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url; // e.g. https://res.cloudinary.com/dmy2texdeal/image/upload/...
}
