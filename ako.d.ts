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

export interface TextLocation {
  line: number;
  column: number;
}

export enum TokenType {
  None = 0,
  Bool = 1,
  Int = 2,
  Float = 3,
  String = 4,
  Identifier = 5,
  Dot = 6,
  Semicolon = 7,
  And = 8,
  OpenBrace = 9,
  CloseBrace = 10,
  OpenDBrace = 11,
  CloseDBrace = 12,
  VectorCross = 13,
}

export interface Token {
  type: TokenType;
  value: null | number | string | boolean;
  locStart: TextLocation | null;
  locEnd: TextLocation | null;
}

export class AkoError extends Error {
  name: "AkoError";
  locStart: TextLocation | null;
  locEnd: TextLocation | null;

  constructor(
    message: string,
    locStart?: TextLocation | null,
    locEnd?: TextLocation | null,
  );
}

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

/**
 * Tokenizes an Ako string into an array of tokens.
 * @param src - The Ako string to tokenize.
 * @returns An array of tokens.
 */
export function tokenize(src: string): Token[];
