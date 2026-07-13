import { z } from "zod";

type BrandKey = string | number | symbol;
type Branded<TBrand extends BrandKey = BrandKey> = z.$brand<TBrand>;
type Unbrand<T> = T extends infer Inner & Branded ? Inner : T;
type BrandOf<T> = T extends { [z.$brand]: infer M }
  ? Extract<keyof M, BrandKey>
  : never;

type BrandEntry<T> = [BrandOf<T>] extends [never]
  ? T extends readonly (infer Item)[]
    ? BrandEntry<Item>
    : T extends object
      ? { [K in keyof T]: BrandEntry<T[K]> }[keyof T]
      : never
  : { brand: Extract<BrandOf<T>, BrandKey>; input: Unbrand<T> };

type InputForBrand<T, B extends BrandKey> =
  Extract<BrandEntry<T>, { brand: B }> extends { input: infer I } ? I : never;

type ExtractBrands<T> =
  BrandEntry<T> extends { brand: infer B } ? Extract<B, BrandKey> : never;

type AnyExpander = ((value: unknown) => unknown | Promise<unknown>) | undefined;

export type ExpandedValue<T, E> = [BrandOf<T>] extends [never]
  ? T extends readonly (infer Item)[]
    ? Array<ExpandedValue<Item, E>>
    : T extends object
      ? { [K in keyof T]: ExpandedValue<T[K], E> }
      : T
  : BrandOf<T> extends keyof E
    ? E[BrandOf<T>] extends (...args: never[]) => infer R
      ? Awaited<R>
      : Unbrand<T>
    : Unbrand<T>;

type ExpanderMapForSchema<S extends z.ZodTypeAny> = {
  [B in ExtractBrands<z.infer<S>>]?: (
    value: InputForBrand<z.infer<S>, B>,
  ) => unknown | Promise<unknown>;
};

const getMeta = (schema: z.ZodTypeAny): Record<string, unknown> | undefined => {
  const meta = schema.meta();
  if (!meta || typeof meta !== "object") {
    return undefined;
  }
  return meta as Record<string, unknown>;
};

const getBrandKey = (schema: z.ZodTypeAny): BrandKey | undefined => {
  const meta = getMeta(schema);
  const brand = meta?.brand;
  if (
    typeof brand === "string" ||
    typeof brand === "number" ||
    typeof brand === "symbol"
  ) {
    return brand;
  }
  return undefined;
};

const expandWithSchemaInternal = async (
  data: unknown,
  schema: z.ZodTypeAny,
  expanders: Record<BrandKey, AnyExpander>,
): Promise<unknown> => {
  if (data === null || data === undefined) {
    return data;
  }

  const brandKey = getBrandKey(schema);
  if (brandKey !== undefined) {
    const expander = expanders[brandKey];
    if (typeof expander === "function") {
      return await expander(data);
    }
  }

  if (schema instanceof z.ZodArray && Array.isArray(data)) {
    return await Promise.all(
      data.map((item) =>
        expandWithSchemaInternal(
          item,
          schema.element as unknown as z.ZodTypeAny,
          expanders,
        ),
      ),
    );
  }

  if (
    schema instanceof z.ZodRecord &&
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data)
  ) {
    const input = data as Record<string, unknown>;
    const valueSchema = schema.valueType as unknown as z.ZodTypeAny;
    const entries = await Promise.all(
      Object.entries(input).map(
        async ([key, value]) =>
          [
            key,
            await expandWithSchemaInternal(value, valueSchema, expanders),
          ] as const,
      ),
    );
    return Object.fromEntries(entries);
  }

  if (
    schema instanceof z.ZodObject &&
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data)
  ) {
    const input = data as Record<string, unknown>;
    const shape = schema.shape;
    const entries = await Promise.all(
      Object.entries(input).map(async ([key, value]) => {
        if (key in shape) {
          const childSchema = shape[key as keyof typeof shape] as z.ZodTypeAny;
          return [
            key,
            await expandWithSchemaInternal(value, childSchema, expanders),
          ] as const;
        }
        return [key, value] as const;
      }),
    );
    return Object.fromEntries(entries);
  }

  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return await expandWithSchemaInternal(
      data,
      schema.unwrap() as unknown as z.ZodTypeAny,
      expanders,
    );
  }

  return data;
};

/**
 * Traverses data alongside a Zod schema.
 *
 * Zod v4 brands are type-only; to apply runtime expansion for a branded field,
 * annotate that field with matching metadata: `.meta({ brand: "your_brand" })`.
 */
export async function expandWithSchema<
  S extends z.ZodTypeAny,
  E extends ExpanderMapForSchema<S>,
>(
  data: z.input<S>,
  schema: S,
  expanders: E,
): Promise<ExpandedValue<z.infer<S>, E>> {
  return (await expandWithSchemaInternal(
    data,
    schema,
    expanders as Record<keyof E & BrandKey, AnyExpander>,
  )) as ExpandedValue<z.infer<S>, E>;
}
