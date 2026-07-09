const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary using upload_stream.
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} The Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload stream error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes a resource from Cloudinary.
 * @param {string} publicId - The public ID of the resource to delete
 * @param {string} resourceType - The resource type ('image', 'raw', 'video')
 * @returns {Promise<Object>} The Cloudinary delete result
 */
const deleteFromCloudinary = (publicId, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: resourceType },
      (error, result) => {
        if (error) {
          console.error('Cloudinary destroy error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
