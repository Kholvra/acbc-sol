import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name minimal 2 karakter")
    .max(50, "Name terlalu panjang"),

  role: z.enum(["DONATUR", "CAMPAIGNER"]),
});
