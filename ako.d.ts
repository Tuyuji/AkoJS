type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[];

type AkoRootObj =
  | { [key: string]: JSONValue }
  | JSONValue[];

/**
 * Serializes a JSON object or array into a formatted string.
 * @param obj - The JSON object or array to serialize.
 * @param do_formatting - Optional. Whether to apply formatting (default: true).
 * @param use_spaces - Optional. If `do_formatting` is true, determines whether to use spaces instead of tabs (default: false).
 * @returns A formatted string representation of the input.
 */
export function serialize(
  obj: AkoRootObj,
  do_formatting?: boolean,
  use_spaces?: boolean,
): string;

/**
 * Parses an Ako string into a JavaScript object or array.
 * @param src - The Ako string to parse.
 * @returns A JavaScript object, array, or null if the parsing fails.
 */
export function parse(src: string): AkoRootObj | null;
