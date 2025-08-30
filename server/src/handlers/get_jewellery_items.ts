import { db } from '../db';
import { jewelleryItemsTable } from '../db/schema';
import { type GetJewelleryItemsInput, type JewelleryItem } from '../schema';
import { eq, desc, and, type SQL } from 'drizzle-orm';

export async function getJewelleryItems(input?: GetJewelleryItemsInput): Promise<JewelleryItem[]> {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];
    
    // Apply category filter if provided and not 'all'
    if (input?.category && input.category !== 'all') {
      conditions.push(eq(jewelleryItemsTable.category, input.category));
    }
    
    // Apply featured filter if requested
    if (input?.featured_only) {
      conditions.push(eq(jewelleryItemsTable.is_featured, true));
    }
    
    // Execute query with or without where clause
    const results = conditions.length > 0
      ? await db.select()
          .from(jewelleryItemsTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .orderBy(desc(jewelleryItemsTable.created_at))
          .execute()
      : await db.select()
          .from(jewelleryItemsTable)
          .orderBy(desc(jewelleryItemsTable.created_at))
          .execute();
    
    return results;
  } catch (error) {
    console.error('Failed to fetch jewellery items:', error);
    throw error;
  }
}