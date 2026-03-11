import { z } from "zod";

const campaignItemSchema = z.object({
  itemName: z.string().min(2, "Item name must contain at least 2 characters"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  estimatedPrice: z
    .number()
    .int()
    .positive("Estimated price must be a positive integer"),
});

export const createCampaignSchema = z.object({
  title: z
    .string()
    .min(3, "Title must contain at least 3 characters")
    .max(120, "Title must not exceed 120 characters"),
  pitchVideoUrl: z.string().url("Pitch video must be a valid URL").optional(),
  category: z.string().min(2, "Category must contain at least 2 characters"),
  province: z.string().min(2, "Province must contain at least 2 characters"),
  targetAmount: z
    .number()
    .int()
    .positive("Target amount must be a positive integer"),
  endDate: z.string().datetime({ message: "End date must be in ISO format" }),
  description: z
    .string()
    .min(20, "Description must contain at least 20 characters"),
  items: z.array(campaignItemSchema).min(1, "At least 1 item is required"),
});

export const updateCampaignSchema = z.object({
  campaignId: z.string().cuid(),
  title: z
    .string()
    .min(3, "Title must contain at least 3 characters")
    .max(120, "Title must not exceed 120 characters")
    .optional(),
  pitchVideoUrl: z.string().url("Pitch video must be a valid URL").optional(),
  category: z
    .string()
    .min(2, "Category must contain at least 2 characters")
    .optional(),
  province: z
    .string()
    .min(2, "Province must contain at least 2 characters")
    .optional(),
  targetAmount: z
    .number()
    .int()
    .positive("Target amount must be a positive integer")
    .optional(),
  endDate: z
    .string()
    .datetime({ message: "End date must be in ISO format" })
    .optional(),
  description: z
    .string()
    .min(20, "Description must contain at least 20 characters")
    .optional(),
});

export const campaignIdSchema = z.object({
  campaignId: z.string().cuid(),
});
