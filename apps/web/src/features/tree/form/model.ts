import { z } from 'zod';
import { createForm } from '../../../shared/lib/create-form';

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Required field' }),
  image: z.string().min(1, { message: 'Image is required' }),
  public: z.boolean().default(false),
});

export type FormValues = z.infer<typeof formSchema>;

export const form = createForm<FormValues>();

export const useBindForm = form.useBindFormWithModel;
