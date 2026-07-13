// 3. Helper function to "Extract" options from the Zod Schema

import type z from "zod";

type Option = {
  value: string | number;
  label: string;
  description?: string;
};

export function getOptionsFromZod(
  schema: z.ZodUnion<readonly z.ZodLiteral<string>[]>,
): Option[] {
  // .options gives us the array of z.literal objects
  return schema.options.map((option: z.ZodLiteral<string>) => {
    const value = option.value;
    const rawDescription = option.description || "";

    // We can use a separator (like '|') in the .describe() string
    // to store both a label and a description
    const [description, label] = rawDescription.split("|");

    return {
      value,
      label: label || value, // Fallback to value if no label provided
      description: description || "",
    };
  });
}
