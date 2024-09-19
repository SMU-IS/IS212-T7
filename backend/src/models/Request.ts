import { RequestType, Status } from "@/helpers";
import mongoose from "mongoose";

interface IRequest {
  requestId: number;
  requestType: RequestType;
  requestedDate: Date;
  reason: string;
  assignedTo: number;
  requestedBy: number;
  status: Status;
}

const Schema = mongoose.Schema;

// Counter Schema to allow auto increment of RequestId
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

async function initializeCounter() {
  const counter = await Counter.findById("requestId");
  if (!counter) {
    await new Counter({ _id: "requestId", seq: 0 }).save();
  }
}

// Initialize counter schema if it doesnt already exist
initializeCounter().catch(console.error);

const RequestSchema = new Schema<IRequest>(
  {
    requestId: { type: Number, unique: true },
    requestType: { type: String, required: true },
    requestedDate: { type: Date, required: true },
    reason: { type: String, required: true },
    assignedTo: { type: Number, required: true },
    requestedBy: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "WITHDRAWN"],
      default: Status.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// set requestId to current counter + 1
RequestSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      "requestId",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.requestId = counter.seq;
  }
  next();
});

RequestSchema.index({ requestId: 1 }, { unique: true });
export default mongoose.model<IRequest>("Request", RequestSchema);
