import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jewelleryItemsTable } from '../db/schema';
import { type UpdateJewelleryItemInput } from '../schema';
import { updateJewelleryItem } from '../handlers/update_jewellery_item';
import { eq } from 'drizzle-orm';

describe('updateJewelleryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let existingItemId: number;
  const baseItemData = {
    title: 'Original Ring',
    description: 'Original description',
    materials: 'Gold and diamonds',
    size: '7',
    category: 'ring' as const,
    image_url: 'original-image.jpg',
    is_featured: false
  };

  beforeEach(async () => {
    // Create a test item to update
    const result = await db.insert(jewelleryItemsTable)
      .values(baseItemData)
      .returning()
      .execute();
    
    existingItemId = result[0].id;
  });

  it('should update a jewellery item with all fields', async () => {
    const updateInput: UpdateJewelleryItemInput = {
      id: existingItemId,
      title: 'Updated Ring',
      description: 'Updated description',
      materials: 'Platinum and emeralds',
      size: '8',
      category: 'pendant',
      image_url: 'updated-image.jpg',
      is_featured: true
    };

    const result = await updateJewelleryItem(updateInput);

    expect(result.id).toEqual(existingItemId);
    expect(result.title).toEqual('Updated Ring');
    expect(result.description).toEqual('Updated description');
    expect(result.materials).toEqual('Platinum and emeralds');
    expect(result.size).toEqual('8');
    expect(result.category).toEqual('pendant');
    expect(result.image_url).toEqual('updated-image.jpg');
    expect(result.is_featured).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const updateInput: UpdateJewelleryItemInput = {
      id: existingItemId,
      title: 'Partially Updated Ring',
      is_featured: true
    };

    const result = await updateJewelleryItem(updateInput);

    // Updated fields
    expect(result.title).toEqual('Partially Updated Ring');
    expect(result.is_featured).toEqual(true);
    
    // Unchanged fields
    expect(result.description).toEqual(baseItemData.description);
    expect(result.materials).toEqual(baseItemData.materials);
    expect(result.size).toEqual(baseItemData.size);
    expect(result.category).toEqual(baseItemData.category);
    expect(result.image_url).toEqual(baseItemData.image_url);
    
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update image_url to null', async () => {
    const updateInput: UpdateJewelleryItemInput = {
      id: existingItemId,
      image_url: null
    };

    const result = await updateJewelleryItem(updateInput);

    expect(result.image_url).toBeNull();
    expect(result.title).toEqual(baseItemData.title); // Other fields unchanged
  });

  it('should always update the updated_at timestamp', async () => {
    // Get the original timestamp
    const originalItem = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, existingItemId))
      .execute();

    const originalUpdatedAt = originalItem[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateJewelleryItemInput = {
      id: existingItemId,
      title: 'Updated Title'
    };

    const result = await updateJewelleryItem(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should save updated item to database', async () => {
    const updateInput: UpdateJewelleryItemInput = {
      id: existingItemId,
      title: 'Database Test Ring',
      category: 'earring'
    };

    await updateJewelleryItem(updateInput);

    // Verify in database
    const items = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, existingItemId))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].title).toEqual('Database Test Ring');
    expect(items[0].category).toEqual('earring');
    expect(items[0].description).toEqual(baseItemData.description); // Unchanged
  });

  it('should throw error when item does not exist', async () => {
    const nonExistentId = 99999;
    const updateInput: UpdateJewelleryItemInput = {
      id: nonExistentId,
      title: 'This should fail'
    };

    await expect(updateJewelleryItem(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle all category types', async () => {
    const categories = ['ring', 'brooch', 'earring', 'pendant', 'cuff_link'] as const;

    for (const category of categories) {
      const updateInput: UpdateJewelleryItemInput = {
        id: existingItemId,
        category: category
      };

      const result = await updateJewelleryItem(updateInput);
      expect(result.category).toEqual(category);
    }
  });

  it('should preserve created_at timestamp when updating', async () => {
    const originalItem = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, existingItemId))
      .execute();

    const originalCreatedAt = originalItem[0].created_at;

    const updateInput: UpdateJewelleryItemInput = {
      id: existingItemId,
      title: 'Updated Title'
    };

    const result = await updateJewelleryItem(updateInput);

    expect(result.created_at.getTime()).toEqual(originalCreatedAt.getTime());
  });
});