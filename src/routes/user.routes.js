import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
const router = Router()

router.route("/register").post(

    // THis is multer middleware, we have two files in it, avatar and coverImage 
    upload.fields([
        { name: "avatar", maxCount: 2 },
        //This name should be used with frontend as well    
        { name: "coverImage", maxCount: 2 }
    ]),
    (req, res, next) => {
        console.log("Files received:", req.files); // Log the files received by Multer for debugging
        next();
    },
    registerUser)




export default router