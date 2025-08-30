import { db } from '../db';
import { jewelleryItemsTable } from '../db/schema';
import { type CreateJewelleryItemInput, type JewelleryItem } from '../schema';

export const createJewelleryItem = async (input: CreateJewelleryItemInput): Promise<JewelleryItem> => {
  try {
    // Insert jewellery item record
    const result = await db.insert(jewelleryItemsTable)
      .values({
        title: input.title,
        description: input.description,
        materials: input.materials,
        size: input.size,
        category: input.category,
        image_url: input.image_url || null,
        is_featured: input.is_featured // Zod default of false is applied by parser
      })
      .returning()
      .execute();

    const jewelleryItem = result[0];
    return {
      ...jewelleryItem
    };
  } catch (error) {
    console.error('Jewellery item creation failed:', error);
    throw error;
  }
};