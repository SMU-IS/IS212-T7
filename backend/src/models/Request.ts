import { RequestType, Status } from "@/helpers";
import { initializeCounter, Counter } from "@/helpers/counter";
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

// Initialize counter schema if it doesnt already exist
// input the tableId you want to auto-increment eg. studentId
initializeCounter("studentId").catch(console.error);

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
