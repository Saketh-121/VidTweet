import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(401, "Provide a videoId for which comments are to be fetched! ");
    }
    const user = req.user;

    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoId
            }
        }
    ])

    return res
        .status(201)
        .json(new ApiResponse(201, comments, "Fetched all comments succesfully! "))
})

const addComment = asyncHandler(async (req, res) => {
    const user = req.user;
    let { body } = req.body;
    body = body.trim();
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(401, "Provide a videoId for which comments are to be fetched! ");
    }
    if (!body) {
        throw new ApiError(402, "Content cannot be empty")
    }
    const comment = await Comment.create(
        {
            content: body,
            video: videoId,
            owner: user._id
        }
    )

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully! "))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { comment } = req.params;
    if (!comment) {
        throw new ApiError(400, "Provide a comment Id")
    }
    const cmt = await Comment.deleteOne({
        _id: comment
    })
    return res
        .status(201)
        .json(new ApiResponse(201, cmt, "Commennt deleted successfully! "))
})

const updateComment = asyncHandler(async (req, res) => {
    const { comment } = req.params;
    if (!comment) {
        throw new ApiError(400, "Provide a comment Id")
    }
    const { content } = req.body;
    const cmt = null;

    try {
        cmt = await Comment.findByIdAndUpdate(
            comment,
            {
                $set: {
                    content
                }
            }
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "Something went wrong while updating comment ")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, cmt, "Commennt deleted successfully! "))
})

export { getVideoComments, addComment, deleteComment, updateComment }