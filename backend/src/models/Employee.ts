import mongoose from "mongoose";

interface IEmployee {
  staffId: number;
  staffFName: string;
  staffLName: string;
  dept: string;
  position: string;
  country: string;
  email: string;
  reportingManager: mongoose.Schema.Types.ObjectId | null;
  role: number;
}

const Schema = mongoose.Schema;
const EmployeeSchema = new Schema<IEmployee>({
  staffId: { type: Number, unique: true, required: true },
  staffFName: { type: String, required: true },
  staffLName: { type: String, required: true },
  dept: { type: String, required: true },
  position: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: false,
  },
  role: { type: Number, required: true },
});

EmployeeSchema.index({ staffId: 1 }, { unique: true });

export default mongoose.model<IEmployee>("Employee", EmployeeSchema);
