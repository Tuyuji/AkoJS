import * as ako from "./ako.js";
import { assert, assertEquals, assertThrows } from "jsr:@std/assert@1";

Deno.test("Parse nothing", () => {
  assertEquals(ako.parse(null), null);
  assertEquals(ako.parse(""), null);
});

Deno.test("Generic serialize", () => {
  const data = {
    "somevec": [
      1,
      1.5,
      2,
      2.5,
    ],
    "somestring": "Some\nBody\n\tOnce",
    "genericnum": 39,
    "genericfloat": 39.39,
  };

  const expectedAko = "somevec 1x1.5x2x2.5\n" +
    'somestring "Some\\nBody\\n\\tOnce"\n' +
    "genericnum 39\n" +
    "genericfloat 39.39\n";

  const result = ako.serialize(data, true, true);
  assertEquals(result, expectedAko);
});

//Check that arrays over 4 elements don't get turned into Ako vectors
//Make sure arrays under 5 elements with types other than numbers don't get turned into vectors.
Deno.test("Vector restrictions", () => {
  const data = {
    "vec2": [1, 2],
    "vec3": [1, 2, 3],
    "vec4": [1, 2, 3, 4],
    "array": [1, 2, 3, 4, 5],
    "NaN": [1, "mi"],
  };

  const expectedAko = "vec2 1x2\n" +
    "vec3 1x2x3\n" +
    "vec4 1x2x3x4\n" +
    "array [[\n" +
    "    1\n" +
    "    2\n" +
    "    3\n" +
    "    4\n" +
    "    5\n" +
    "]]\n" +
    "NaN [[\n" +
    "    1\n" +
    '    "mi"\n' +
    "]]\n";

  const result = ako.serialize(data, true, true);
  assertEquals(result, expectedAko);
});

Deno.test("Parse Generic", () => {
  const akoSrc = '"m i k u" 39.39\nviva.viva "happy"';

  const result = ako.parse(akoSrc);
  assertEquals(result, {
    "m i k u": 39.39,
    viva: { viva: "happy" },
  });
});

Deno.test("Simple string escape", () => {
  const akoSrc = 'abc "1 \\"2\\" 3"';

  const result = ako.parse(akoSrc);
  assertEquals(result, {
    abc: '1 "2" 3',
  });
});

Deno.test("Parse vector", () => {
  const akoSrc = "v2 1x2\nv3 1x2.5x3\nv4 1x2.5x3x3.5";

  const result = ako.parse(akoSrc);
  assertEquals(result, {
    v2: [1, 2],
    v3: [1, 2.5, 3],
    v4: [1, 2.5, 3, 3.5],
  });
});

Deno.test("Parse vector limits", () => {
  const akoSrc = "v5 1x2x3x4x5";
  assertThrows(() => ako.parse(akoSrc));
});

Deno.test("Parse and serialize", () => {
  const data = {
    player: {
      username: "Miku",
      level: 39,
    },
    window: {
      size: [1280, 720, 59.9],
    },
  };

  const newData = ako.parse(ako.serialize(data, false));
  assertEquals(data, newData);
});

Deno.test("Unexpected char", () => {
  assertThrows(() => ako.parse("hm !"));
});

Deno.test("Invalid vector", () => {
  const thrownerror = assertThrows(() => ako.parse("ivt 200x100x"));
  //A bit hacky
  assert(
    thrownerror.message.includes("Expected a number after vector delimiter"),
  );
});

Deno.test("Identifier with X", () => {
  //Vectors use X as a delimiter so make sure that doesn't cross paths
  const data = ako.parse("x86_64 2");
  assertEquals(data, { x86_64: 2 });

  //make sure vectors still work as expected

  const data_2ndPass = ako.parse("x86_64 2x2");
  assertEquals(data_2ndPass, { x86_64: [2, 2] });
});

Deno.test("Comments", () => {
  const data = ako.parse("# viva!\nhm 39");
  assertEquals(data, { hm: 39 });
});

Deno.test("Only a comment", () => {
  const data = ako.parse("# viva! viva");
  assertEquals(data, null);
});
