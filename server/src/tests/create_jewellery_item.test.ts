import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jewelleryItemsTable } from '../db/schema';
import { type CreateJewelleryItemInput } from '../schema';
import { createJewelleryItem } from '../handlers/create_jewellery_item';
import { eq } from 'drizzle-orm';

// Simple test input with all required fields
const testInput: CreateJewelleryItemInput = {
  title: 'Elegant Diamond Ring',
  description: 'A beautiful diamond ring perfect for special occasions',
  materials: '18k gold, natural diamond',
  size: 'Size 7 (adjustable)',
  category: 'ring',
  image_url: 'https://example.com/ring.jpg',
  is_featured: true
};

// Minimal test input with defaults
const minimalInput: CreateJewelleryItemInput = {
  title: 'Simple Silver Brooch',
  description: 'Minimalist silver brooch with clean lines',
  materials: 'Sterling silver',
  size: '2 inches diameter',
  category: 'brooch',
  is_featured: false // Include all fields even those with defaults
  // image_url not provided (optional)
};

describe('createJewelleryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a jewellery item with all fields', async () => {
    const result = await createJewelleryItem(testInput);

    // Basic field validation
    expect(result.title).toEqual('Elegant Diamond Ring');
    expect(result.description).toEqual('A beautiful diamond ring perfect for special occasions');
    expect(result.materials).toEqual('18k gold, natural diamond');
    expect(result.size).toEqual('Size 7 (adjustable)');
    expect(result.category).toEqual('ring');
    expect(result.image_url).toEqual('https://example.com/ring.jpg');
    expect(result.is_featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a jewellery item with minimal fields and defaults', async () => {
    const result = await createJewelleryItem(minimalInput);

    expect(result.title).toEqual('Simple Silver Brooch');
    expect(result.description).toEqual('Minimalist silver brooch with clean lines');
    expect(result.materials).toEqual('Sterling silver');
    expect(result.size).toEqual('2 inches diameter');
    expect(result.category).toEqual('brooch');
    expect(result.image_url).toBeNull(); // Should be null when not provided
    expect(result.is_featured).toEqual(false); // Should default to false
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save jewellery item to database', async () => {
    const result = await createJewelleryItem(testInput);

    // Query using proper drizzle syntax
    const jewelleryItems = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, result.id))
      .execute();

    expect(jewelleryItems).toHaveLength(1);
    expect(jewelleryItems[0].title).toEqual('Elegant Diamond Ring');
    expect(jewelleryItems[0].description).toEqual('A beautiful diamond ring perfect for special occasions');
    expect(jewelleryItems[0].materials).toEqual('18k gold, natural diamond');
    expect(jewelleryItems[0].size).toEqual('Size 7 (adjustable)');
    expect(jewelleryItems[0].category).toEqual('ring');
    expect(jewelleryItems[0].image_url).toEqual('https://example.com/ring.jpg');
    expect(jewelleryItems[0].is_featured).toEqual(true);
    expect(jewelleryItems[0].created_at).toBeInstanceOf(Date);
    expect(jewelleryItems[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle different jewellery categories correctly', async () => {
    const categories = ['ring', 'brooch', 'earring', 'pendant', 'cuff_link'] as const;
    
    for (const category of categories) {
      const categoryInput: CreateJewelleryItemInput = {
        title: `Test ${category}`,
        description: `A beautiful ${category} for testing`,
        materials: 'Gold and silver',
        size: 'Standard size',
        category: category,
        is_featured: false
      };

      const result = await createJewelleryItem(categoryInput);

      expect(result.category).toEqual(category);
      expect(result.title).toEqual(`Test ${category}`);

      // Verify in database
      const items = await db.select()
        .from(jewelleryItemsTable)
        .where(eq(jewelleryItemsTable.id, result.id))
        .execute();

      expect(items).toHaveLength(1);
      expect(items[0].category).toEqual(category);
    }
  });

  it('should handle null image_url correctly', async () => {
    const inputWithNullImage: CreateJewelleryItemInput = {
      ...minimalInput,
      image_url: null
    };

    const result = await createJewelleryItem(inputWithNullImage);

    expect(result.image_url).toBeNull();

    // Verify in database
    const items = await db.select()
      .from(jewelleryItemsTable)
      .where(eq(jewelleryItemsTable.id, result.id))
      .execute();

    expect(items[0].image_url).toBeNull();
  });

  it('should create multiple jewellery items independently', async () => {
    const earringInput: CreateJewelleryItemInput = {
      title: 'Pearl Earrings',
      description: 'Classic pearl drop earrings',
      materials: 'Freshwater pearls, gold posts',
      size: '1.5 inch drop',
      category: 'earring',
      is_featured: true
    };

    const pendantInput: CreateJewelleryItemInput = {
      title: 'Heart Pendant',
      description: 'Delicate heart-shaped pendant',
      materials: 'Rose gold, cubic zirconia',
      size: '0.75 inch heart',
      category: 'pendant',
      is_featured: false
    };

    // Create both items
    const earring = await createJewelleryItem(earringInput);
    const pendant = await createJewelleryItem(pendantInput);

    // Verify they have different IDs
    expect(earring.id).not.toEqual(pendant.id);
    expect(earring.category).toEqual('earring');
    expect(pendant.category).toEqual('pendant');
    expect(earring.is_featured).toEqual(true);
    expect(pendant.is_featured).toEqual(false);

    // Verify both are in database
    const allItems = await db.select()
      .from(jewelleryItemsTable)
      .execute();

    expect(allItems).toHaveLength(2);
    
    const titles = allItems.map(item => item.title).sort();
    expect(titles).toEqual(['Heart Pendant', 'Pearl Earrings']);
  });
});