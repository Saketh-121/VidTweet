import multer from "multer";
import path from 'path'

const fileStorage = multer.diskStorage({
    destination: "./public/temp",

    filename: function (req, file, cb) {
        console.log("this is filename function ", file);
        return cb(null, file.originalname)
    }
})

export const upload = multer({
    storage: fileStorage,
});