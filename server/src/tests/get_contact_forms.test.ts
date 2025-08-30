import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactFormsTable } from '../db/schema';
import { getContactForms } from '../handlers/get_contact_forms';

describe('getContactForms', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no contact forms exist', async () => {
    const result = await getContactForms();

    expect(result).toEqual([]);
  });

  it('should return all contact forms ordered by most recent first', async () => {
    // Create test contact forms with different timestamps
    const firstForm = await db.insert(contactFormsTable)
      .values({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'First inquiry about rings'
      })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondForm = await db.insert(contactFormsTable)
      .values({
        name: 'Jane Smith',
        email: 'jane@example.com',
        message: 'Second inquiry about brooches'
      })
      .returning()
      .execute();

    // Wait again
    await new Promise(resolve => setTimeout(resolve, 10));

    const thirdForm = await db.insert(contactFormsTable)
      .values({
        name: 'Bob Wilson',
        email: 'bob@example.com',
        message: 'Latest inquiry about earrings'
      })
      .returning()
      .execute();

    const result = await getContactForms();

    expect(result).toHaveLength(3);
    
    // Should be ordered by most recent first (descending by created_at)
    expect(result[0].name).toEqual('Bob Wilson');
    expect(result[1].name).toEqual('Jane Smith');
    expect(result[2].name).toEqual('John Doe');

    // Verify all fields are present and correct
    expect(result[0].id).toBeDefined();
    expect(result[0].email).toEqual('bob@example.com');
    expect(result[0].message).toEqual('Latest inquiry about earrings');
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should handle contact forms with various message lengths and special characters', async () => {
    // Create contact forms with edge case data
    await db.insert(contactFormsTable)
      .values({
        name: "O'Connor & Associates",
        email: 'contact@oconnor-associates.co.uk',
        message: 'Inquiry about custom jewellery with "special quotes" and symbols: £€$!'
      })
      .execute();

    await db.insert(contactFormsTable)
      .values({
        name: 'Short Name',
        email: 'test@test.com',
        message: 'Brief message.'
      })
      .execute();

    const longMessage = 'A'.repeat(1500); // Long but within 2000 char limit
    await db.insert(contactFormsTable)
      .values({
        name: 'Long Message User',
        email: 'long@example.com',
        message: longMessage
      })
      .execute();

    const result = await getContactForms();

    expect(result).toHaveLength(3);
    
    // Verify special characters are preserved
    const specialCharForm = result.find(form => form.name === "O'Connor & Associates");
    expect(specialCharForm).toBeDefined();
    expect(specialCharForm!.message).toContain('"special quotes"');
    expect(specialCharForm!.message).toContain('£€$!');

    // Verify long message is preserved
    const longMessageForm = result.find(form => form.name === 'Long Message User');
    expect(longMessageForm).toBeDefined();
    expect(longMessageForm!.message).toEqual(longMessage);
    expect(longMessageForm!.message.length).toEqual(1500);
  });

  it('should return contact forms with all required fields', async () => {
    await db.insert(contactFormsTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message for field validation'
      })
      .execute();

    const result = await getContactForms();

    expect(result).toHaveLength(1);
    const contactForm = result[0];

    // Verify all required fields are present and have correct types
    expect(typeof contactForm.id).toBe('number');
    expect(typeof contactForm.name).toBe('string');
    expect(typeof contactForm.email).toBe('string');
    expect(typeof contactForm.message).toBe('string');
    expect(contactForm.created_at).toBeInstanceOf(Date);

    // Verify specific values
    expect(contactForm.name).toEqual('Test User');
    expect(contactForm.email).toEqual('test@example.com');
    expect(contactForm.message).toEqual('Test message for field validation');
    expect(contactForm.id).toBeGreaterThan(0);
  });
});