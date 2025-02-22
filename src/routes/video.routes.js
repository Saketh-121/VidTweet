import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { } from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);



export default router;