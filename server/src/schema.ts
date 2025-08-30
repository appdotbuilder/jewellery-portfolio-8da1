import { z } from 'zod';

// Jewellery category enum
export const jewelleryCategorySchema = z.enum(['ring', 'brooch', 'earring', 'pendant', 'cuff_link']);
export type JewelleryCategory = z.infer<typeof jewelleryCategorySchema>;

// Jewellery item schema
export const jewelleryItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  materials: z.string(),
  size: z.string(),
  category: jewelleryCategorySchema,
  image_url: z.string().nullable(), // Can be null if no image uploaded yet
  is_featured: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type JewelleryItem = z.infer<typeof jewelleryItemSchema>;

// Input schema for creating jewellery items
export const createJewelleryItemInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  materials: z.string().min(1, "Materials information is required"),
  size: z.string().min(1, "Size information is required"),
  category: jewelleryCategorySchema,
  image_url: z.string().nullable().optional(), // Optional during creation
  is_featured: z.boolean().default(false)
});

export type CreateJewelleryItemInput = z.infer<typeof createJewelleryItemInputSchema>;

// Input schema for updating jewellery items
export const updateJewelleryItemInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  materials: z.string().min(1, "Materials information is required").optional(),
  size: z.string().min(1, "Size information is required").optional(),
  category: jewelleryCategorySchema.optional(),
  image_url: z.string().nullable().optional(),
  is_featured: z.boolean().optional()
});

export type UpdateJewelleryItemInput = z.infer<typeof updateJewelleryItemInputSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
  created_at: z.coerce.date()
});

export type ContactForm = z.infer<typeof contactFormSchema>;

// Input schema for contact form submission
export const submitContactFormInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Valid email address is required"),
  message: z.string().min(1, "Message is required").max(2000, "Message must be less than 2000 characters")
});

export type SubmitContactFormInput = z.infer<typeof submitContactFormInputSchema>;

// Schema for filtering jewellery items
export const jewelleryCategoryFilterSchema = z.enum(['all', 'ring', 'brooch', 'earring', 'pendant', 'cuff_link']);
export type JewelleryCategoryFilter = z.infer<typeof jewelleryCategoryFilterSchema>;

export const getJewelleryItemsInputSchema = z.object({
  category: jewelleryCategoryFilterSchema.optional(),
  featured_only: z.boolean().optional()
});

export type GetJewelleryItemsInput = z.infer<typeof getJewelleryItemsInputSchema>;

// File upload schema
export const uploadImageInputSchema = z.object({
  filename: z.string(),
  content_type: z.string(),
  file_data: z.string() // base64 encoded file data
});

export type UploadImageInput = z.infer<typeof uploadImageInputSchema>;

export const uploadImageResponseSchema = z.object({
  url: z.string(),
  filename: z.string()
});

export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;