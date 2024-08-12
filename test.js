import * as ako from './ako.js';
import { assertEquals, assertThrows } from "jsr:@std/assert@1";

Deno.test("Generic serialize", () => {
    const data = {
        "somevec": [
            1, 1.5, 2, 2.5
        ],
        "somestring": "Some\nBody\n\tOnce",
        "genericnum": 39,
        "genericfloat": 39.39
    }

    const expectedAko =
        "somevec 1x1.5x2x2.5\n" +
        "somestring \"Some\\nBody\\n\\tOnce\"\n" +
        "genericnum 39\n" +
        "genericfloat 39.39\n"

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
    }

    const expectedAko =
        "vec2 1x2\n" +
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
        "    \"mi\"\n" +
        "]]\n";

    const result = ako.serialize(data, true, true);
    assertEquals(result, expectedAko);
});

Deno.test("Parse Generic", () => {
    const akoSrc = "\"m i k u\" 39.39\nviva.viva \"happy\""

    const result = ako.parse(akoSrc);
    assertEquals(result, {
        "m i k u": 39.39,
        viva: {viva: "happy"}
    });
});

Deno.test("Parse vector", () => {
    const akoSrc = "v2 1x2\nv3 1x2.5x3\nv4 1x2.5x3x3.5";

    const result = ako.parse(akoSrc);
    assertEquals(result, {
        v2: [1,2],
        v3: [1, 2.5, 3],
        v4: [1, 2.5, 3, 3.5],
    });
});

Deno.test("Parse vector limits", () => {
    const akoSrc = "v5 1x2x3x4x5";
    assertThrows(() => ako.parse(akoSrc));
});