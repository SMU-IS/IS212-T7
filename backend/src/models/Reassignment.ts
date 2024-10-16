import { Status } from "@/helpers";
import { Counter, initializeCounter } from "@/helpers/counter";
import mongoose from "mongoose";

export interface IReassignment {
  reassignmentId: number;
  staffId: number;
  staffName: string;
  startDate: Date;
  endDate: Date;
  tempReportingManagerId: number;
  tempManagerName: string;
  status: Status;
  active: boolean | null;
}

const Schema = mongoose.Schema;
initializeCounter("reassignmentId").catch(console.error);

const ReassignmentSchema = new Schema<IReassignment>(
  {
    reassignmentId: { type: Number, unique: true },
    staffId: {
      type: Number,
      ref: "Employee",
      required: true,
    },
    staffName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tempReportingManagerId: { type: Number, required: true },
    tempManagerName: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        Status.PENDING,
        Status.APPROVED,
        Status.REJECTED,
        Status.CANCELLED,
        Status.WITHDRAWN,
        Status.EXPIRED,
      ],
      default: Status.PENDING,
    },
    active: { type: Boolean, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ReassignmentSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      "reassignmentId",
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.reassignmentId = counter.seq;
  }
  next();
});

ReassignmentSchema.index({ reassignmentId: 1 }, { unique: true });
export default mongoose.model<IReassignment>(
  "Reassignment",
  ReassignmentSchema,
);
