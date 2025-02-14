import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {


    // Step 1: Get user details from FrontEnd
    const { fullName, email, username, password } = req.body
    console.log("email: ", email);


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

    if (req.files?.avatar[0]?.originalname === req.files?.coverImage[0]?.originalname) {
        throw new ApiError(400, "Avatar and Cover image can't be same.")
    }

    // req.files is given by multer, we might/not have it's access, hence use ? operator
    const avatarLocalPath = req.files?.avatar[0]?.path  //first property coz from here we can get the path
    const coverImageLocalPath = req.files?.coverImage[0]?.path


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

    if (!coverImage) {
        throw new ApiError(500, "Unable to upload cover image")
    }


    // step 7: create a user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url, //Pass only the url here, not the whole object
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase().trim()
    })


    // step 8: remove password and refresh token field from response; as this will go to the user
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
        //by default all are selected itself, minus ke baaju whatever is written shows what shall be deseclected
    )


    // step 9: Check for user response, if null hai or user is created
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    // step 10: return response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "Registered Successfully")
    )

})

export { registerUser }