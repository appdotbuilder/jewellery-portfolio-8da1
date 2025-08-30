import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactFormsTable } from '../db/schema';
import { type SubmitContactFormInput } from '../schema';
import { submitContactForm } from '../handlers/submit_contact_form';
import { eq } from 'drizzle-orm';

// Test input data
const testInput: SubmitContactFormInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  message: 'I am interested in your jewellery collection. Could you please provide more information about custom orders?'
};

const minimalInput: SubmitContactFormInput = {
  name: 'A',
  email: 'a@b.co',
  message: 'Hi'
};

const longMessageInput: SubmitContactFormInput = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  message: 'A'.repeat(2000) // Maximum length message
};

describe('submitContactForm', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should save contact form submission to database', async () => {
    const result = await submitContactForm(testInput);

    // Verify returned data
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.message).toEqual(testInput.message);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should persist contact form in database', async () => {
    const result = await submitContactForm(testInput);

    // Query database to verify data was saved
    const savedForms = await db.select()
      .from(contactFormsTable)
      .where(eq(contactFormsTable.id, result.id))
      .execute();

    expect(savedForms).toHaveLength(1);
    
    const savedForm = savedForms[0];
    expect(savedForm.name).toEqual('John Doe');
    expect(savedForm.email).toEqual('john.doe@example.com');
    expect(savedForm.message).toEqual(testInput.message);
    expect(savedForm.created_at).toBeInstanceOf(Date);
  });

  it('should handle minimal valid input', async () => {
    const result = await submitContactForm(minimalInput);

    expect(result.name).toEqual('A');
    expect(result.email).toEqual('a@b.co');
    expect(result.message).toEqual('Hi');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify in database
    const savedForms = await db.select()
      .from(contactFormsTable)
      .where(eq(contactFormsTable.id, result.id))
      .execute();

    expect(savedForms).toHaveLength(1);
    expect(savedForms[0].name).toEqual('A');
  });

  it('should handle maximum length message', async () => {
    const result = await submitContactForm(longMessageInput);

    expect(result.name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane.smith@example.com');
    expect(result.message).toEqual('A'.repeat(2000));
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify message length was preserved
    expect(result.message.length).toBe(2000);
  });

  it('should create multiple contact forms with different IDs', async () => {
    const result1 = await submitContactForm(testInput);
    const result2 = await submitContactForm(minimalInput);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.name).toEqual('John Doe');
    expect(result2.name).toEqual('A');

    // Verify both exist in database
    const allForms = await db.select()
      .from(contactFormsTable)
      .execute();

    expect(allForms).toHaveLength(2);
    
    const ids = allForms.map(form => form.id);
    expect(ids).toContain(result1.id);
    expect(ids).toContain(result2.id);
  });

  it('should set created_at timestamp automatically', async () => {
    const beforeSubmission = new Date();
    const result = await submitContactForm(testInput);
    const afterSubmission = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at >= beforeSubmission).toBe(true);
    expect(result.created_at <= afterSubmission).toBe(true);

    // Verify timestamp in database
    const savedForms = await db.select()
      .from(contactFormsTable)
      .where(eq(contactFormsTable.id, result.id))
      .execute();

    expect(savedForms[0].created_at).toBeInstanceOf(Date);
    expect(savedForms[0].created_at >= beforeSubmission).toBe(true);
    expect(savedForms[0].created_at <= afterSubmission).toBe(true);
  });

  it('should handle special characters in input', async () => {
    const specialCharInput: SubmitContactFormInput = {
      name: 'José María Ñoño',
      email: 'jose.maria@español.com',
      message: 'Hello! I love your work 💍✨ Can you create custom pieces with émaux & filigree?'
    };

    const result = await submitContactForm(specialCharInput);

    expect(result.name).toEqual('José María Ñoño');
    expect(result.email).toEqual('jose.maria@español.com');
    expect(result.message).toEqual(specialCharInput.message);

    // Verify special characters are preserved in database
    const savedForms = await db.select()
      .from(contactFormsTable)
      .where(eq(contactFormsTable.id, result.id))
      .execute();

    expect(savedForms[0].name).toEqual('José María Ñoño');
    expect(savedForms[0].message).toContain('💍✨');
    expect(savedForms[0].message).toContain('émaux');
  });
});