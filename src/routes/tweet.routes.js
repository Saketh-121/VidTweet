import { Router } from "express";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

// All routes shall be secured routes itself
router.use(verifyJWT);
router.route("/create-tweet").post(createTweet);
router.route("/user/:userName").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet);
router.route("/:tweetId").delete(deleteTweet);

export default router;