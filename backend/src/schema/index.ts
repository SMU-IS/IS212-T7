import { Status } from "@/helpers";
import { z } from "zod";

const numberSchema = z.string().transform((val) => {
  const number = Number(val);
  if (isNaN(number)) {
    throw new Error("Invalid Number");
  }
  return number;
});

const requestSchema = z.object({
  staffId: z.string(),
  status: z.nativeEnum(Status),
});

export { numberSchema, requestSchema };
