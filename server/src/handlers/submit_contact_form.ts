import { db } from '../db';
import { contactFormsTable } from '../db/schema';
import { type SubmitContactFormInput, type ContactForm } from '../schema';

export const submitContactForm = async (input: SubmitContactFormInput): Promise<ContactForm> => {
  try {
    // Insert contact form submission into database
    const result = await db.insert(contactFormsTable)
      .values({
        name: input.name,
        email: input.email,
        message: input.message
      })
      .returning()
      .execute();

    const savedForm = result[0];
    
    // TODO: Send email notification to configured email address
    // This would typically involve an email service like SendGrid, AWS SES, etc.
    // For now, we'll just log that a form was submitted
    console.log(`New contact form submission from ${input.name} (${input.email})`);

    return savedForm;
  } catch (error) {
    console.error('Contact form submission failed:', error);
    throw error;
  }
};