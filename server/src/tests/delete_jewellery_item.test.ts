import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jewelleryItemsTable } from '../db/schema';
import { type CreateJewelleryItemInput } from '../schema';
import { deleteJewelleryItem } from '../handlers/delete_jewellery_item';
import { eq } from 'drizzle-orm';

// Test data for creating jewellery items
const testJewelleryItem: CreateJewelleryItemInput = {
  title: 'Test Ring',
  description: 'A beautiful test ring',
  materials: 'Sterling silver',
  size: '7',
  category: 'ring',
  image_url: 'https://example.com/ring.jpg',
  is_featured: false
};

describe('deleteJewelleryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing jewellery item', async () => {
    // Create a test item first
    const createResult = await db.insert(jewelleryItemsTable)
      .values({
        title: testJewelleryItem.title,
        description: testJewelleryItem.description,
        materials: testJewelleryItem.materials,
        size: testJewelleryItem.size,
        category: testJewelleryItem.category,
        image_url: testJewelleryItem.image_url,
        is_featured: testJewelleryItem.is_featured
      })
      .returning()
      .execute();

    const createdItem = createResult[0];
    expect(createdItem.id).toBeDefined();

    // Delete the item
    const deleteResult = await deleteJewelleryItem(createdItem.id);
    expect(deleteResult).toBe(true);

    // Verify the item no longer exists in the database
    const items = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, createdItem.id))
      .execute();

    expect(items).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent item', async () => {
    // Try to delete an item with an ID that doesn't exist
    const deleteResult = await deleteJewelleryItem(99999);
    expect(deleteResult).toBe(false);
  });

  it('should not affect other items when deleting one item', async () => {
    // Create two test items
    const item1Result = await db.insert(jewelleryItemsTable)
      .values({
        title: 'Test Ring 1',
        description: 'First test ring',
        materials: 'Gold',
        size: '6',
        category: 'ring',
        image_url: null,
        is_featured: true
      })
      .returning()
      .execute();

    const item2Result = await db.insert(jewelleryItemsTable)
      .values({
        title: 'Test Brooch 1',
        description: 'First test brooch',
        materials: 'Silver',
        size: 'Medium',
        category: 'brooch',
        image_url: 'https://example.com/brooch.jpg',
        is_featured: false
      })
      .returning()
      .execute();

    const item1 = item1Result[0];
    const item2 = item2Result[0];

    // Delete only the first item
    const deleteResult = await deleteJewelleryItem(item1.id);
    expect(deleteResult).toBe(true);

    // Verify first item is deleted
    const deletedItems = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, item1.id))
      .execute();
    expect(deletedItems).toHaveLength(0);

    // Verify second item still exists
    const remainingItems = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, item2.id))
      .execute();
    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].title).toEqual('Test Brooch 1');
  });

  it('should handle deletion of featured items correctly', async () => {
    // Create a featured item
    const featuredItemResult = await db.insert(jewelleryItemsTable)
      .values({
        title: 'Featured Pendant',
        description: 'A special featured pendant',
        materials: 'Platinum with diamonds',
        size: 'Large',
        category: 'pendant',
        image_url: 'https://example.com/featured.jpg',
        is_featured: true
      })
      .returning()
      .execute();

    const featuredItem = featuredItemResult[0];

    // Delete the featured item
    const deleteResult = await deleteJewelleryItem(featuredItem.id);
    expect(deleteResult).toBe(true);

    // Verify it's actually deleted
    const items = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, featuredItem.id))
      .execute();
    expect(items).toHaveLength(0);
  });

  it('should handle items with null image_url correctly', async () => {
    // Create an item without an image
    const itemResult = await db.insert(jewelleryItemsTable)
      .values({
        title: 'No Image Earring',
        description: 'Earring without image',
        materials: 'Stainless steel',
        size: 'Small',
        category: 'earring',
        image_url: null,
        is_featured: false
      })
      .returning()
      .execute();

    const item = itemResult[0];
    expect(item.image_url).toBeNull();

    // Delete the item
    const deleteResult = await deleteJewelleryItem(item.id);
    expect(deleteResult).toBe(true);

    // Verify deletion
    const items = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, item.id))
      .execute();
    expect(items).toHaveLength(0);
  });
});