import cloudinary from "cloudinary";
import streamifier from 'streamifier';

export const UploadSinglePhotoToCloudinary = async (req) => {
  try {
    const base64Image = `data:${req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      resource_type: "image", folder: "profile-photos",
    });

    console.log(result.secure_url.toString());
    console.log("Image uploaded successfully to Cloudinary");

    return result.secure_url.toString();
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error; // Propagate the error to the calling function
  }
};
export const UploadVideoAndThumbnail = async (req) => {
  try {
    // Ensure files are present
    if (!req.files.video || !req.files.thumbnail) {
      throw new Error('Video and thumbnail files are required');
    }

    // Log files to debug
    console.log('Thumbnail:', req.files.thumbnail[0]);
    console.log('Video:', req.files.video[0]);

    // Upload thumbnail (Base64 method)
    const base64Image = `data:${req.files.thumbnail[0].mimetype};base64,${req.files.thumbnail[0].buffer.toString('base64')}`;
    const thumbnailResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
      folder: 'thumbnails',
    });
    console.log('Thumbnail uploaded:', thumbnailResult.secure_url);

    // Upload video (Stream method)
    const uploadVideoStream = (buffer, folder) => {

      return new Promise((resolve, reject) => {
        console.log('Starting video upload...');
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'video' },
          (error, result) => {
            if (error) {
              console.error('Error in Cloudinary upload stream:', error);

              return reject(error);
            }
            console.log('Video uploaded successfully:', result);

            resolve(result);
          }
        );
        console.log('Starting to pipe buffer to Cloudinary upload stream...');
        streamifier.createReadStream(buffer)
          .on('error', (err) => {
            console.error('Error while reading the stream:', err);
          })
          .pipe(uploadStream)
          .on('finish', () => {
            console.log('Stream finished successfully.');
          })
          .on('error', (err) => {
            console.error('Error while piping stream:', err);
          });

      });
    };

    const videoFileBuffer = req.files.video[0].buffer;
    const videoResult = await uploadVideoStream(videoFileBuffer, 'videos');
    console.log('Video uploaded:', videoResult.secure_url);

    // Return the uploaded file URLs
    return {
      message: 'Files uploaded successfully',
      videoUrlNew: videoResult.secure_url,
      thumbnailUrlNew: thumbnailResult.secure_url,
    };
  } catch (error) {
    console.error('Error uploading files to Cloudinary:', error);
    throw error;
  }
};
