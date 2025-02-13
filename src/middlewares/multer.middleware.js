import multer from "multer";
import path from 'path'

const fileStorage = multer.diskStorage({
    destination: "./public/temp",
    // destination: function (req, file, cb) {
    //     console.log("the filename is  ", file.originalname);

    //     cb(null, "../Vidtube/public/temp")
    // },
    filename: function (req, file, cb) {
        console.log("this is filename function ");
        // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // cb(null, uniqueSuffix + path.extname(file.originalname)); 
        cb(null, file.originalname)
    }
})



export const upload = multer({
    storage: fileStorage
})

// export const upload = multer({
//     storage,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// }).fields([
//     { name: "avatar", maxCount: 1 },
//     { name: "coverImage", maxCount: 1 },
// ]);