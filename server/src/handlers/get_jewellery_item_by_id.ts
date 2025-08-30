import { db } from '../db';
import { jewelleryItemsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type JewelleryItem } from '../schema';

export async function getJewelleryItemById(id: number): Promise<JewelleryItem | null> {
  try {
    // Query the database for a jewellery item with the specified ID
    const results = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, id))
      .execute();

    // Return null if no item found
    if (results.length === 0) {
      return null;
    }

    // Return the first (and should be only) result
    const item = results[0];
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      materials: item.materials,
      size: item.size,
      category: item.category,
      image_url: item.image_url,
      is_featured: item.is_featured,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  } catch (error) {
    console.error('Failed to fetch jewellery item:', error);
    throw error;
  }
}