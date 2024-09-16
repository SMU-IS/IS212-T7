import { z } from "zod";

const roleIdSchema = z.enum(["1", "2", "3"]);

export { roleIdSchema };
