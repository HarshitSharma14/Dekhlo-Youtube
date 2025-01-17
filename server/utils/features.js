import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export const UploadSinglePhotoToCloudinary = async (req) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "ProfilePhoto", // Specify the Cloudinary folder
        },
        (error, result) => {
          if (error) {
            reject(error); // Reject the promise if there's an error
          } else {
            resolve(result); // Resolve the promise with the result
          }
        }
      );

      // Pipe the file buffer to the Cloudinary stream
      streamifier.createReadStream(req.file.buffer).pipe(stream);
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
  console.log("in uploading space");
  try {
    // Helper function to upload a single file
    const uploadFile = (file, options) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    console.log("created Stream");
    // Upload the photo
    const photoResult = req.files?.thumbnail
      ? await uploadFile(req.files.thumbnail[0], {
          resource_type: "image",
          folder: "Thumbnails", // Store photos in 'Photos' folder
        })
      : null;
    console.log("photo uploaded");
    // Upload the video
    const videoResult = req.files?.video
      ? await uploadFile(req.files.video[0], {
          resource_type: "video",
          folder: "Videos", // Store videos in 'Videos' folder
        })
      : null;
    console.log("video uplaoded");
    // Response with the uploaded file details
    return {
      message: "Files uploaded successfully",
      videoUrlNew: videoResult?.secure_url || null,
      thumbnailUrlNew: photoResult?.secure_url || null,
    };
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error);
    throw error;
  }
};
