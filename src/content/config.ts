import { z } from 'astro/zod';
import { defineCollection, reference } from "astro:content";

export const craftersCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string()
  })
});

export const gatherersCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string()
  })
});

export const recipesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    type: reference("warsupplies"),
    crafter: reference("crafters"),
    amount: z.number().default(1),
    inputs: z.array(z.object({
      component: reference("components"),
      amount: z.number()
    }))
  })
});

export const warSuppliesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    crafters: reference("crafters").array(),
    note: z.string().optional()
  })
});

export const componentsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    crafter: reference("crafters"),
    materials: z.array(z.object({
      material: reference("materials"),
      amount: z.number().default(1),
    }))
  })
});

export const materialsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    grade: z.number(),
    gatherer: reference("gatherers"),
    group: z.string()
  })
});

export const collections = {
  crafters: craftersCollection,
  gatherers: gatherersCollection,
  recipes: recipesCollection,
  warsupplies: warSuppliesCollection,
  components: componentsCollection,
  materials: materialsCollection,
}