import { z } from 'zod';

/**
 * Creates a schema that handles indexed union variants.
 *
 * On the wire a union value is a positional envelope: `{ __use: <variant index>, __value: <variant> }`.
 * The index is load-bearing - it is the only discriminator for variants that carry no `__identifier`
 * of their own (primitives, structures) - so it cannot be derived from the value alone on decode.
 *
 * Decode also accepts an already-unwrapped value, which makes it idempotent: patch values arrive in
 * wire form and get spliced into an already-decoded document, so a re-validated document is mixed.
 */
export function createIndexedUnion<T extends [z.ZodTypeAny, ...z.ZodTypeAny[]]>(
  schemas: T,
) {
  const flat = z.union(schemas);
  const wrapped = z.union(
    schemas.map((schema, index) =>
      z.object({ __use: z.literal(index), __value: schema }),
    ) as unknown as [z.ZodTypeAny, ...z.ZodTypeAny[]],
  );
  const wire = z.union([wrapped, flat]);

  type Decoded = z.input<typeof flat>;
  type Encoded = z.output<typeof wire>;

  return z.codec(wire, flat, {
    decode: (value) => {
      const envelope = value as { __use?: number; __value?: unknown };

      return (
        envelope && typeof envelope === 'object' && '__use' in envelope
          ? envelope.__value
          : value
      ) as Decoded;
    },
    encode: (value, payload) => {
      // First match wins, mirroring the predicate loop the backend shrinks unions with.
      const index = schemas.findIndex(
        (schema) => schema.safeParse(value).success,
      );

      if (index === -1) {
        payload.issues.push({
          code: 'invalid_union',
          errors: [],
          input: value,
          message: 'Value does not match any variant of the union',
        });

        return z.NEVER;
      }

      return { __use: index, __value: value } as Encoded;
    },
  });
}
