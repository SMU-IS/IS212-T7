import { RequestDay, RequestType, Status } from "@/helpers";
import mongoose, { Date } from "mongoose";

interface IRequest {
  requestId: number;
  requestType: RequestType;
  requestedDate: Date;
  requestedDay: RequestDay;
  reason: string;
  assignedTo: number;
  approvedOn: Date;
  status: Status;
}

const Schema = mongoose.Schema;
const RequestSchema = new Schema<IRequest>(
  {
    requestId: { type: Number, unique: true, required: true },
    requestType: { type: String, required: true },
    requestedDate: { type: Date, required: true },
    requestedDay: { type: String, required: true },
    reason: { type: String, required: true },
    assignedTo: { type: Number, required: true },
    approvedOn: { type: Date, required: true },
    status: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

RequestSchema.index({ requestId: 1 }, { unique: true });

export default mongoose.model<IRequest>("Request", RequestSchema);
