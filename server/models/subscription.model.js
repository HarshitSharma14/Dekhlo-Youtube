import mongoose, { model, models, Schema } from "mongoose";

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

const Subscription =
  models.Subscription || model("Subscription", subscriptionSchema);

export default Subscription;
