import cloudinary from "cloudinary";

export const UploadSinglePhotoToCloudinary = async (req) => {
  try {
    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      resource_type: "image",
    });

    console.log(result.secure_url.toString());
    console.log("Image uploaded successfully to Cloudinary");

    return result.secure_url.toString();
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error; // Propagate the error to the calling function
  }
};
