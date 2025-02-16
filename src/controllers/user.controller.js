import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); //this means no need to check password
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
}


const registerUser = asyncHandler(async (req, res) => {

    // Step 1: Get user details from FrontEnd
    const { fullName, email, username, password } = req.body
    // console.log("email: ", email);


    // Step 2: Validation if all details have been sent correctly- not empty

    /*The below method requires many IF-ELSE, hence writing a better condition after 5 lines
    if (fullName === '') 
        throw new ApiError(400, "Enter a fullName");
    */

    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "" //If even a single element is empty, returns true
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }


    // Step 3: Check if user already exists: Use username and email both
    const existingUser = await User.findOne({
        $or: [{ username }, { email }] //$or returns if atleast one of them is true
    })

    if (existingUser) {
        throw new ApiError(409, "This user already exists ")
    }


    // Step 4: check for images

    if (Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 && req.files?.avatar[0]?.originalname === req.files?.coverImage[0]?.originalname) {
        throw new ApiError(400, "Avatar and Cover image can't be same.")
    }

    // req.files is given by multer, we might/not have it's access, hence use ? operator
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;


    let coverImageLocalPath = null;    //above giving error, hence if-else thingy
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // Step 5: Check for avatar, this is compulsory
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }


    // step 6: Upload to cloudinary, avatar ko check if upload properly

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Unable to upload avatar");
    }


    // step 7: create a user object - create entry in db

    let user;
    //if coverImage exists, then enter If condition
    if (coverImage) {
        user = await User.create({
            fullName,
            avatar: avatar.url, //Pass only the url here, not the whole object
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase().trim()
        })
    }

    else {
        user = await User.create({
            fullName,
            avatar: avatar.url, //Pass only the url here, not the whole object,
            coverImage: "",
            email,
            password,
            username: username.toLowerCase().trim()
        })
    }


    // step 8: remove password and refresh token field from response; as this will go to the user
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //by default all are selected itself, minus ke baaju whatever is written shows what shall be deseclected


    // step 9: Check for user response, if null hai or user is created
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    // step 10: return response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "Registered Successfully")
    )

})


const loginUser = asyncHandler(async (req, res) => {

    // 1. collect data from body

    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;


    // 2. username or email, either of them should be present
    if (!username && !email) {
        throw new ApiError(400, "Username or password is required")
    }


    // 3. Find the user
    const user = await User.findOne({
        $or: [
            { username: { $regex: new RegExp("^" + username + "$", "i") } },
            { email }
        ]
    })

    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }


    // 4. Password Check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password");
    }

    // 5. access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);


    // 6. Send cookie  
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") //need to send this

    const options = {
        httpOnly: true,
        secure: true
    } //Actually, anyone can modify this on frontend, but after next step only server se modifiable hai cookies

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user logged in successfully"
            )
        )

})


const logoutUser = asyncHandler(async (req, res) => {

    // 1. Remove refresh token
    await User.findByIdAndUpdate(
        req.user._id,
        // what to update?
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "unauthorized request");
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }

})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        )
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current user fetched successfully")
})


const updateAccountDetails = asyncHandler(async (req, res) => {
    const fullName = req.body;
    const email = req.body;

    if (!fullName && !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }     //Due to this, the updated info is returned
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})


const updateUserAvatar = asyncHandler(async (req, res) => {

    //take the file input
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(500, "Unable to upload avatar to cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(201)
        .json(new ApiResponse(201, user, "Avatar updated Successfully"));
})



const updateUserCoverImage = asyncHandler(async (req, res) => {

    //take the file input
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(500, "Unable to upload cover image to cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(201)
        .json(new ApiResponse(201, user, "Cover Image updated Successfully"));
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}