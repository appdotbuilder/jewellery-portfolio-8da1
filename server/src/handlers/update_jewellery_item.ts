import { db } from '../db';
import { jewelleryItemsTable } from '../db/schema';
import { type UpdateJewelleryItemInput, type JewelleryItem } from '../schema';
import { eq } from 'drizzle-orm';

export const updateJewelleryItem = async (input: UpdateJewelleryItemInput): Promise<JewelleryItem> => {
  try {
    // Extract the id for the where clause
    const { id, ...updateData } = input;

    // Build the update object with only provided fields
    const updateValues: Partial<typeof jewelleryItemsTable.$inferInsert> = {};
    
    if (updateData.title !== undefined) {
      updateValues.title = updateData.title;
    }
    
    if (updateData.description !== undefined) {
      updateValues.description = updateData.description;
    }
    
    if (updateData.materials !== undefined) {
      updateValues.materials = updateData.materials;
    }
    
    if (updateData.size !== undefined) {
      updateValues.size = updateData.size;
    }
    
    if (updateData.category !== undefined) {
      updateValues.category = updateData.category;
    }
    
    if (updateData.image_url !== undefined) {
      updateValues.image_url = updateData.image_url;
    }
    
    if (updateData.is_featured !== undefined) {
      updateValues.is_featured = updateData.is_featured;
    }

    // Always update the updated_at timestamp
    updateValues.updated_at = new Date();

    // Update the jewellery item
    const result = await db.update(jewelleryItemsTable)
      .set(updateValues)
      .where(eq(jewelleryItemsTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Jewellery item with id ${id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Jewellery item update failed:', error);
    throw error;
  }
};