import mongoose, { model, Schema } from "mongoose";

const subscriptionSchema = new Schema({
  subscriber: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
  },
  creator: {
    type: Schema.Types.ObjectId,
    index: true,
    ref: "Channel",
  },
  bell: {
    type: Boolean,
    default: true,
  },
});

subscriptionSchema.index({ subscriber: 1, creator: 1 });
subscriptionSchema.index({ creator: 1, bell: 1 });

const Subscription = model("Subscription", subscriptionSchema);

export default Subscription;
