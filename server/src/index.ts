import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createJewelleryItemInputSchema,
  updateJewelleryItemInputSchema,
  getJewelleryItemsInputSchema,
  submitContactFormInputSchema,
  uploadImageInputSchema
} from './schema';

// Import handlers
import { createJewelleryItem } from './handlers/create_jewellery_item';
import { getJewelleryItems } from './handlers/get_jewellery_items';
import { getJewelleryItemById } from './handlers/get_jewellery_item_by_id';
import { updateJewelleryItem } from './handlers/update_jewellery_item';
import { deleteJewelleryItem } from './handlers/delete_jewellery_item';
import { submitContactForm } from './handlers/submit_contact_form';
import { getContactForms } from './handlers/get_contact_forms';
import { uploadImage } from './handlers/upload_image';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Jewellery item management routes
  createJewelleryItem: publicProcedure
    .input(createJewelleryItemInputSchema)
    .mutation(({ input }) => createJewelleryItem(input)),

  getJewelleryItems: publicProcedure
    .input(getJewelleryItemsInputSchema.optional())
    .query(({ input }) => getJewelleryItems(input)),

  getJewelleryItemById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getJewelleryItemById(input.id)),

  updateJewelleryItem: publicProcedure
    .input(updateJewelleryItemInputSchema)
    .mutation(({ input }) => updateJewelleryItem(input)),

  deleteJewelleryItem: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteJewelleryItem(input.id)),

  // Contact form routes
  submitContactForm: publicProcedure
    .input(submitContactFormInputSchema)
    .mutation(({ input }) => submitContactForm(input)),

  getContactForms: publicProcedure
    .query(() => getContactForms()),

  // Image upload route
  uploadImage: publicProcedure
    .input(uploadImageInputSchema)
    .mutation(({ input }) => uploadImage(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();