import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jewelleryItemsTable } from '../db/schema';
import { type CreateJewelleryItemInput } from '../schema';
import { getJewelleryItemById } from '../handlers/get_jewellery_item_by_id';

// Test data for creating jewellery items
const testJewelleryItem: CreateJewelleryItemInput = {
  title: 'Elegant Silver Ring',
  description: 'A beautiful handcrafted silver ring with intricate details',
  materials: 'Sterling Silver 925',
  size: 'Size 7 (US)',
  category: 'ring',
  image_url: 'https://example.com/silver-ring.jpg',
  is_featured: true
};

const testJewelleryItem2: CreateJewelleryItemInput = {
  title: 'Vintage Brooch',
  description: 'An antique-style brooch with floral motifs',
  materials: 'Gold plated brass, pearls',
  size: '3cm x 2cm',
  category: 'brooch',
  image_url: null, // Test null image_url
  is_featured: false
};

describe('getJewelleryItemById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should fetch a jewellery item by ID', async () => {
    // Insert a test item
    const insertResult = await db.insert(jewelleryItemsTable)
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

    const insertedItem = insertResult[0];

    // Fetch the item by ID
    const result = await getJewelleryItemById(insertedItem.id);

    // Verify all fields are correct
    expect(result).toBeDefined();
    expect(result!.id).toEqual(insertedItem.id);
    expect(result!.title).toEqual('Elegant Silver Ring');
    expect(result!.description).toEqual(testJewelleryItem.description);
    expect(result!.materials).toEqual('Sterling Silver 925');
    expect(result!.size).toEqual('Size 7 (US)');
    expect(result!.category).toEqual('ring');
    expect(result!.image_url).toEqual('https://example.com/silver-ring.jpg');
    expect(result!.is_featured).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null image_url correctly', async () => {
    // Insert a test item with null image_url
    const insertResult = await db.insert(jewelleryItemsTable)
      .values({
        title: testJewelleryItem2.title,
        description: testJewelleryItem2.description,
        materials: testJewelleryItem2.materials,
        size: testJewelleryItem2.size,
        category: testJewelleryItem2.category,
        image_url: testJewelleryItem2.image_url,
        is_featured: testJewelleryItem2.is_featured
      })
      .returning()
      .execute();

    const insertedItem = insertResult[0];

    // Fetch the item by ID
    const result = await getJewelleryItemById(insertedItem.id);

    // Verify all fields including null image_url
    expect(result).toBeDefined();
    expect(result!.id).toEqual(insertedItem.id);
    expect(result!.title).toEqual('Vintage Brooch');
    expect(result!.category).toEqual('brooch');
    expect(result!.image_url).toBeNull();
    expect(result!.is_featured).toEqual(false);
  });

  it('should return null when item does not exist', async () => {
    // Try to fetch a non-existent item
    const result = await getJewelleryItemById(999999);

    expect(result).toBeNull();
  });

  it('should fetch correct item when multiple items exist', async () => {
    // Insert multiple test items
    const insertResult1 = await db.insert(jewelleryItemsTable)
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

    const insertResult2 = await db.insert(jewelleryItemsTable)
      .values({
        title: testJewelleryItem2.title,
        description: testJewelleryItem2.description,
        materials: testJewelleryItem2.materials,
        size: testJewelleryItem2.size,
        category: testJewelleryItem2.category,
        image_url: testJewelleryItem2.image_url,
        is_featured: testJewelleryItem2.is_featured
      })
      .returning()
      .execute();

    const item1 = insertResult1[0];
    const item2 = insertResult2[0];

    // Fetch the second item specifically
    const result = await getJewelleryItemById(item2.id);

    // Verify we got the correct item
    expect(result).toBeDefined();
    expect(result!.id).toEqual(item2.id);
    expect(result!.title).toEqual('Vintage Brooch');
    expect(result!.category).toEqual('brooch');
    expect(result!.is_featured).toEqual(false);

    // Also verify we can still fetch the first item
    const result1 = await getJewelleryItemById(item1.id);
    expect(result1).toBeDefined();
    expect(result1!.title).toEqual('Elegant Silver Ring');
    expect(result1!.category).toEqual('ring');
  });

  it('should handle different jewellery categories correctly', async () => {
    // Test each category
    const categories = ['ring', 'brooch', 'earring', 'pendant', 'cuff_link'] as const;
    const insertedIds: number[] = [];

    // Insert items for each category
    for (const category of categories) {
      const insertResult = await db.insert(jewelleryItemsTable)
        .values({
          title: `Test ${category}`,
          description: `A test ${category} item`,
          materials: 'Test materials',
          size: 'Test size',
          category,
          image_url: null,
          is_featured: false
        })
        .returning()
        .execute();

      insertedIds.push(insertResult[0].id);
    }

    // Verify each category item can be fetched correctly
    for (let i = 0; i < categories.length; i++) {
      const result = await getJewelleryItemById(insertedIds[i]);
      
      expect(result).toBeDefined();
      expect(result!.category).toEqual(categories[i]);
      expect(result!.title).toEqual(`Test ${categories[i]}`);
    }
  });
});