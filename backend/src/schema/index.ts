import { Dept, Status } from "@/helpers";
import { z } from "zod";

const numberSchema = z.string().transform((val) => {
  const number = Number(val);
  if (isNaN(number)) {
    throw new Error("Invalid Number");
  }
  return number;
});

const requestSchema = z.object({
  staffId: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
  dept: z.nativeEnum(Dept).optional(),
});

export { numberSchema, requestSchema };
