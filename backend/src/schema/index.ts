import { z } from "zod";

const numberSchema = z.string().transform((val) => {
  const number = Number(val);
  if (isNaN(number)) {
    throw new Error("Invalid Number");
  }
  return number;
});

const roleIdSchema = z.enum(["1", "2", "3"]);

export { numberSchema, roleIdSchema };
