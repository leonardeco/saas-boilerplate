import { z } from "zod";

export const citySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  departmentCode: z.string().optional(),
  isMajor: z.boolean(),
});

export const municipalitySchema = z.object({
  id: z.string().uuid(),
  cityId: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
});

export type City = z.infer<typeof citySchema>;
export type Municipality = z.infer<typeof municipalitySchema>;
