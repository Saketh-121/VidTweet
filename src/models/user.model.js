import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowerCase: true,
            trim: true,
            index: true //This makes the object searchable optimisedly, but VERY expensive
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowerCase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            lowerCase: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudinary url
            required: true,
        },
        coverImage: {
            type: String //not req
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"] //This is custom error message
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
);


userSchema.pre("save", async function (next) {
    // If this password is NOT modified then return with next() pointer
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10); //.hash(what is needed to be encryoted? , number of rounds)
    next()
})


//We have created the below method in mongoose, this is to validate password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
    // compare(clearText Password, hashed Password)
}


userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// Refresh Token since it gets refreshed again& again, less info(only id) is given in Payload
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);