import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export const UploadSinglePhotoToCloudinary = async (req) => {
  try {
    // const base64Image = `data:${
    //   req.file.mimetype
    // };base64,${req.file.buffer.toString("base64")}`;

    // const result = await cloudinary.uploader.upload(base64Image, {
    //   resource_type: "image",
    // });

    // console.log(result.secure_url.toString());
    // console.log("Image uploaded successfully to Cloudinary");

    // return result.secure_url.toString();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image", // Ensure it's treated as an image
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
