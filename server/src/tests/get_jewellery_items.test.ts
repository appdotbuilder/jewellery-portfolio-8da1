import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jewelleryItemsTable } from '../db/schema';
import { type GetJewelleryItemsInput, type CreateJewelleryItemInput } from '../schema';
import { getJewelleryItems } from '../handlers/get_jewellery_items';

// Test data for creating jewellery items
const testItems: CreateJewelleryItemInput[] = [
  {
    title: 'Silver Ring',
    description: 'Beautiful silver ring',
    materials: 'Sterling silver',
    size: 'Size 7',
    category: 'ring',
    is_featured: true
  },
  {
    title: 'Gold Brooch',
    description: 'Elegant gold brooch',
    materials: '18k gold',
    size: '2 inches',
    category: 'brooch',
    is_featured: false
  },
  {
    title: 'Diamond Earrings',
    description: 'Sparkling diamond earrings',
    materials: 'Platinum with diamonds',
    size: 'Standard',
    category: 'earring',
    is_featured: true
  },
  {
    title: 'Pearl Pendant',
    description: 'Classic pearl pendant',
    materials: 'Freshwater pearl',
    size: '1 inch',
    category: 'pendant',
    is_featured: false
  }
];

const createTestItems = async () => {
  await db.insert(jewelleryItemsTable)
    .values(testItems.map(item => ({
      title: item.title,
      description: item.description,
      materials: item.materials,
      size: item.size,
      category: item.category,
      image_url: item.image_url || null,
      is_featured: item.is_featured
    })))
    .execute();
};

describe('getJewelleryItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all items when no filters are provided', async () => {
    await createTestItems();
    
    const result = await getJewelleryItems();
    
    expect(result).toHaveLength(4);
    expect(result[0].title).toBeDefined();
    expect(result[0].description).toBeDefined();
    expect(result[0].materials).toBeDefined();
    expect(result[0].size).toBeDefined();
    expect(result[0].category).toBeDefined();
    expect(result[0].is_featured).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return all items when category is "all"', async () => {
    await createTestItems();
    
    const input: GetJewelleryItemsInput = {
      category: 'all'
    };
    
    const result = await getJewelleryItems(input);
    
    expect(result).toHaveLength(4);
  });

  it('should filter by specific category', async () => {
    await createTestItems();
    
    const input: GetJewelleryItemsInput = {
      category: 'ring'
    };
    
    const result = await getJewelleryItems(input);
    
    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Silver Ring');
    expect(result[0].category).toEqual('ring');
  });

  it('should filter by featured items only', async () => {
    await createTestItems();
    
    const input: GetJewelleryItemsInput = {
      featured_only: true
    };
    
    const result = await getJewelleryItems(input);
    
    expect(result).toHaveLength(2);
    result.forEach(item => {
      expect(item.is_featured).toBe(true);
    });
  });

  it('should filter by category and featured status', async () => {
    await createTestItems();
    
    const input: GetJewelleryItemsInput = {
      category: 'earring',
      featured_only: true
    };
    
    const result = await getJewelleryItems(input);
    
    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Diamond Earrings');
    expect(result[0].category).toEqual('earring');
    expect(result[0].is_featured).toBe(true);
  });

  it('should return empty array when no items match filters', async () => {
    await createTestItems();
    
    const input: GetJewelleryItemsInput = {
      category: 'cuff_link',
      featured_only: true
    };
    
    const result = await getJewelleryItems(input);
    
    expect(result).toHaveLength(0);
  });

  it('should return items ordered by creation date (newest first)', async () => {
    // Create items with slight delay to ensure different timestamps
    await db.insert(jewelleryItemsTable)
      .values({
        title: 'First Item',
        description: 'First created',
        materials: 'Silver',
        size: 'Small',
        category: 'ring',
        is_featured: false
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(jewelleryItemsTable)
      .values({
        title: 'Second Item',
        description: 'Second created',
        materials: 'Gold',
        size: 'Large',
        category: 'brooch',
        is_featured: false
      })
      .execute();

    const result = await getJewelleryItems();
    
    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Second Item');
    expect(result[1].title).toEqual('First Item');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle empty database correctly', async () => {
    const result = await getJewelleryItems();
    
    expect(result).toHaveLength(0);
  });

  it('should handle null image_url correctly', async () => {
    await db.insert(jewelleryItemsTable)
      .values({
        title: 'No Image Item',
        description: 'Item without image',
        materials: 'Silver',
        size: 'Medium',
        category: 'pendant',
        image_url: null,
        is_featured: false
      })
      .execute();

    const result = await getJewelleryItems();
    
    expect(result).toHaveLength(1);
    expect(result[0].image_url).toBeNull();
    expect(result[0].title).toEqual('No Image Item');
  });
});