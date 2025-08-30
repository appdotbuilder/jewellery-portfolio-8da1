import { db } from '../db';
import { jewelleryItemsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteJewelleryItem(id: number): Promise<boolean> {
  try {
    // Delete the jewellery item by id
    const result = await db.delete(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, id))
      .execute();

    // Return true if a row was deleted, false if no item found
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Jewellery item deletion failed:', error);
    throw error;
  }
}