type JSONValue =
    | string
    | number
    | boolean
    | { [key: string]: JSONValue }
    | JSONValue[];

/**
 * Serializes a JSON-compatible object or array into a formatted string.
 * @param thing - The JSON-compatible object or array to serialize.
 * @param do_formatting - Optional. Whether to apply formatting (default: true).
 * @param use_spaces - Optional. If `do_formatting` is true, determines whether to use spaces instead of tabs (default: false).
 * @returns A formatted string representation of the input.
 */
export function serialize(thing: JSONValue, do_formatting?: boolean, use_spaces?: boolean): string;

/**
 * Parses an Ako-formatted string into a JavaScript object or array.
 * @param src - The Ako-formatted string to parse.
 * @returns A JavaScript object, array, or null if the parsing fails.
 */
export function parse(src: string): JSONValue | null;
