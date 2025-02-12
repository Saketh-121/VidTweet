import multer from "multer";

const storage = multer.diskStorage({
    //this 'file' in arguments in with multer only
    destination: function (req, file, cb) {
        cb(null, "./public/temp") //Here a;; files are saved
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})