import { z } from "zod";

const staffIdSchema = z.object({
  id: z.string(),
});

const numberSchema = z.string().transform((val) => {
  const number = Number(val);
  if (isNaN(number)) {
    throw new Error("Invalid Number");
  }
  return number;
});

const requestSchema = z.object({
  staffId: z.number(),
  requestedDates: z.array(z.tuple([z.string(), z.string()])),
  reason: z.string(),
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

export {
  approvalSchema,
  numberSchema,
  rejectionSchema,
  requestSchema,
  staffIdSchema,
};
