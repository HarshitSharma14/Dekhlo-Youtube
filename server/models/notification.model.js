import { model, Schema } from "mongoose";


const notificationSchema = new Schema(
    {
        channel: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: "Channel",
            required: [true, "channel id is required"]
        },
        message: {
            type: String,
            required: [true, "Alert message required"],
        },
        isRead: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

notificationSchema.index({ channel: 1, createdAt: 1 }); // Compound index for efficient pagination and sorting

const Notification = model("Notification", notificationSchema)
export default Notification;

