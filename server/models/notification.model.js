import { model, Schema } from "mongoose";


const notificationSchema = new Schema(
    {
        channel: {
            type: Schema.Types.ObjectId,
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

const Notification = model("Notification", notificationSchema)
export default Notification;

