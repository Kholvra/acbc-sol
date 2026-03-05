import { z } from "zod";

export const uploadKtpSchema = z.object({
  imageBase64: z.string().max(5_000_000, "Image size must be less than 5MB"),
});

export const ktpExtractedSchema = z.object({
  name: z.string(),
  nik: z.string().regex(/^\d{16}$/, "NIK must be a 16-digit number"),
});
