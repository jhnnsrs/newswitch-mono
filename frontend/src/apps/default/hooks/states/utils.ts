import { z } from 'zod';

/**
 * Creates a schema that handles indexed union variants.
 */
export function createIndexedUnion<T extends [z.ZodTypeAny, ...z.ZodTypeAny[]]>(
  schemas: T,
) {
  return z.union(schemas);
}
