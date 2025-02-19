import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.static("public")) //Whatever photos and all, we save in public folder

// This is to parse JSON body
app.use(express.json());  // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // To parse URL-encoded bodies



app.use(cookieParser()) // This is to access cookies from user's browser and be able to perform CRUD operations
// We even have secure cookies, in whixh only server will be able to read them and update them


// ************     Routes Import  **********

import userRouter from "./routes/user.routes.js"
import tweetRouter from "./routes/tweet.routes.js"



//  ************  Routes Declaration *************

// Our URL becomes something like http://localhost:8000/api/v1/users/register
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)




export { app }