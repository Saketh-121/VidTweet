import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js";
import mongoose from "mongoose";


const createTweet = asyncHandler(async (req, res) => {
    let { content } = req.body;
    content = content.trim();
    const ownerId = req.user._id;

    if (!content) {
        throw new ApiError(400, "Content cannot be empty!");
    }

    const tweet = await Tweet.create({
        owner: ownerId,
        content
    })

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, " Tweet posted successfully! "));
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userName } = req.params;
    if (!userName) {
        throw new ApiError(402, "Provide a username")
    }

    const user_id = await User.aggregate([
        {
            $match: { username: userName }
        }
    ])._id

    const tweet = await Tweet.aggregate([
        {
            $match: { owner: user_id }
        }
    ])

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweets fetched successfully "));
})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;
    console.log(tweetId);

    if (!content.trim()) {
        throw new ApiError(402, " Write something in content ")
    }

    let tweet = null;
    try {
        tweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set: {
                    content
                }
            },
            { new: true }
        )
    } catch (error) {
        throw new ApiError(500, error.message)
    }

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet updated successfully "))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(402, " Write something in content ")
    }

    const tweet = await Tweet.deleteOne({ _id: tweetId });
    return res
        .status(201)
        .json(new ApiResponse(201, tweet, " Tweet Deleted successfully! "))
})

export { createTweet, getUserTweets, updateTweet, deleteTweet }