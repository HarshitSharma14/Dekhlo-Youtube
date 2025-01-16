import mongoose, { model, Schema } from "mongoose";

const subscriptionSchema = new Schema({
  subscriber: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
  },
  bell: {
    type: Boolean,
    default: true,
  },
});

const Subscription = model("Subscription", subscriptionSchema);

export default Subscription;
