import mongoose, { Schema, SchemaType, Types } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User" //to whom is he subscribing
        }
    },
    { timestamps: true }
);

export const subscription = mongoose.model("subscription", subscriptionSchema) 