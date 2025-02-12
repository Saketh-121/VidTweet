import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
const router = Router()

router.route("/register").post(
    // THis is multer middleware, we have two files in it, avatar and coverImage 
    upload.fields([
        {
            name: "avatar", //This name should be used with frontend as well
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)




export default router