import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import { ApiError } from './ApiError.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // Upload file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //File has been uploaded successfully
        // console.log("File is uploaded on cloudinary!! ", response.url);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


const deleteFromCloudinary = async (oldFilePath) => {
    try {
        const publicId = oldFilePath.split('/').slice(-2).join('/').split('.')[0];

        const response = await cloudinary.uploader.destroy(publicId, function (error, result) {
            if (error) {
                console.error("Error deleting file:", error);
            } else {
                console.log("File deleted successfully:", result);
            }
        });
        return response;

    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to delete image from cloudinary")
    }
}



export { uploadOnCloudinary, deleteFromCloudinary }