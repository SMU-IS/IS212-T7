import { RequestType, Status } from "@/helpers";
import { Counter, initializeCounter } from "@/helpers/counter";
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
initializeCounter("requestId").catch(console.error);

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
