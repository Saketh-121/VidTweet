import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" })) //Data got by filling a form
app.use(express.urlencoded({ extended: true, limit: "16kb" })) //Deriving data from url
app.use(express.static("public")) //Whatever photos and all, we save in public folder

app.use(cookieParser()) // This is to access cookies from user's browser and be able to perform CRUD operations
// We even have secure cookies, in whixh only server will be able to read them and update them


// ************     Routes Import  **********

import userRouter from "./routes/user.routes.js"






//  ************  Routes Declaration *************

// Our URL becomes something like http://localhost:8000/api/v1/users/register
app.use("/api/v1/users", userRouter) //this is basically version 1 of my API







export { app }