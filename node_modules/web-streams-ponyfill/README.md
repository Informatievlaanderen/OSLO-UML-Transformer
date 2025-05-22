# web-streams-ponyfill
Web Streams [ponyfill](https://ponyfill.com), based on the WHATWG spec reference implementation.  

## Links
 - [Official spec](https://streams.spec.whatwg.org/)
 - [Reference implementation](https://github.com/whatwg/streams)

## Usage

```javascript

var streams = require("web-streams-ponyfill");
var readable = new streams.ReadableStream;

// Or, in ES6

import { ReadableStream } from "web-streams-ponyfill";

```

## Credits

Original author:
 - Diwank Singh [creatorrr](https://github.com/creatorrr/)
 
Contributors:
 - Anders Riutta [ariutta](https://github.com/ariutta)
 - [bellbind](https://github.com/bellbind)