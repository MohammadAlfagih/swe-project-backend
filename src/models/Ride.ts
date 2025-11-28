import { Schema, model, Document, Types } from "mongoose";

export interface IRide extends Document {
  driver: Types.ObjectId;
  passenger?: Types.ObjectId; // Optional initially
  from: string;
  to: string;
  status: "open" | "booked" | "completed" | "cancelled";
  startTime: Date; // Added this so users know WHEN the ride is
  createdAt: Date;
}

const RideSchema = new Schema<IRide>(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "User", // Links to the User model
      required: true,
    },
    passenger: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "booked", "completed", "cancelled"],
      default: "open",
    },
    startTime: { type: Date, required: true },
  },
  { timestamps: true }
);

const Ride = model<IRide>("Ride", RideSchema);
export default Ride;