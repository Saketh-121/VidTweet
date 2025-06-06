import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGOBD_URI}/${DB_NAME}`)
        // console.log(connectionInstance);

        console.log("\n MongoDB Connected DB Host: ", connectionInstance.connection.host);

    } catch (error) {
        console.log("MongoDB connection Failed in index.js in db folder : ", error);
        process.exit(1)
    }
}

export default connectDB