import { serial, text, pgTable, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Define the jewellery category enum
export const jewelleryCategoryEnum = pgEnum('jewellery_category', [
  'ring', 
  'brooch', 
  'earring', 
  'pendant', 
  'cuff_link'
]);

// Jewellery items table
export const jewelleryItemsTable = pgTable('jewellery_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  materials: text('materials').notNull(),
  size: text('size').notNull(),
  category: jewelleryCategoryEnum('category').notNull(),
  image_url: text('image_url'), // Nullable by default - can be null if no image uploaded
  is_featured: boolean('is_featured').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Contact form submissions table
export const contactFormsTable = pgTable('contact_forms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type JewelleryItem = typeof jewelleryItemsTable.$inferSelect; // For SELECT operations
export type NewJewelleryItem = typeof jewelleryItemsTable.$inferInsert; // For INSERT operations

export type ContactForm = typeof contactFormsTable.$inferSelect; // For SELECT operations
export type NewContactForm = typeof contactFormsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { 
  jewelleryItems: jewelleryItemsTable,
  contactForms: contactFormsTable
};