# AkoJS

Ako Parser and Serializer for JavaScript

For info about Ako see
[Ako's README](https://github.com/Tuyuji/Ako/blob/main/README.md)

# Example
```typescript
//Deno
import * as ako from "@tuyuji/akojs";

/*
-fullscreen
window.size 1280x720
 */
var akosrc = "...";

var data = ako.parse(akosrc);
//data = 
/*
{
    "fullscreen": false,
    "window": {
        "size": [
            1280,
            720
        ],
    },
}
 */

console.log(ako.serialize({"fullscreen": false, "window": {"size": [1280, 720]}}));
/*
-fullscreen
window [ 
    1280x720
]
 */
```