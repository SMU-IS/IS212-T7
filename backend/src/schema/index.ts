import { Dept } from "@/helpers";
import { z } from "zod";

const numberSchema = z.string().transform((val) => {
  const number = Number(val);
  if (isNaN(number)) {
    throw new Error("Invalid Number");
  }
  return number;
});

const requestSchema = z.object({
  staffId: z.number(),
  staffName: z.string(),
  reportingManager: z.number(),
  managerName: z.string(),
  dept: z.nativeEnum(Dept),
  requestedDates: z.array(z.tuple([z.string(), z.string()])),
  reason: z.string(),
});

const teamSchema = z.object({
  reportingManager: z.string(),
  dept: z.string(),
});

const deptSchema = z.object({
  dept: z.nativeEnum(Dept),
});

const approvalSchema = z.object({
  performedBy: z.number(),
  requestId: z.number(),
});

const rejectionSchema = z.object({
  performedBy: z.number(),
  requestId: z.number(),
  reason: z.string(),
});

export { deptSchema, numberSchema, requestSchema, teamSchema, approvalSchema, rejectionSchema };
