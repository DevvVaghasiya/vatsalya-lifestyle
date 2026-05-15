/**
 * cloudinary.js
 * Uploads an image File/Blob to Cloudinary using an unsigned upload preset.
 * Returns the secure HTTPS URL of the uploaded image.
 *
 * Setup (free account at cloudinary.com):
 *   1. Create a free Cloudinary account.
 *   2. In Settings → Upload → Upload Presets, add a new preset.
 *   3. Set Signing Mode to "Unsigned".
 *   4. Set the preset name to 'vatsalya_dp' (or update UPLOAD_PRESET below).
 */

const CLOUD_NAME    = 'da0kbcwzw';   // ← your Cloudinary cloud name
const UPLOAD_PRESET = 'vatsalya_dp'; // ← must be an UNSIGNED preset in Cloudinary dashboard

/**
 * @param {File} file  - The image file selected by the user
 * @returns {Promise<string>}  - Resolves to the secure Cloudinary image URL
 */
export async function uploadToCloudinary(file) {
  if (!file) throw new Error('No file provided');

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, WEBP, etc.)');
  }

  // Validate file size (max 10 MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image is too large. Please choose an image under 10 MB.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'profile_pictures');

  let response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
  } catch (networkErr) {
    throw new Error('Network error — check your internet connection and try again.');
  }

  if (!response.ok) {
    let message = `Upload failed (HTTP ${response.status})`;
    try {
      const err = await response.json();
      if (err.error?.message) {
        // Make common Cloudinary errors friendlier
        if (err.error.message.includes('Upload preset')) {
          message = `Cloudinary upload preset "${UPLOAD_PRESET}" not found or is not set to Unsigned. Please check Cloudinary dashboard Settings → Upload → Upload Presets.`;
        } else if (err.error.message.includes('Invalid cloud')) {
          message = `Invalid Cloudinary cloud name "${CLOUD_NAME}". Please check the CLOUD_NAME in cloudinary.js.`;
        } else {
          message = err.error.message;
        }
      }
    } catch (_) {
      // ignore JSON parse errors — keep the default message
    }
    throw new Error(message);
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error('Cloudinary did not return an image URL. Please try again.');
  }

  return data.secure_url;
}
