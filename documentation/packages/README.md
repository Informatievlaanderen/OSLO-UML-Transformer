# External libraries

This project is wrtitten in TypeScript and commonjs. Libraries that are written in TypeScript and commonjs can be used without any problems. Libraries that are written in JavaScript and commonjs can also be used without any problems. Libraries that are written in JavaScript and ESM can be used with some limitations. Libraries that are written in TypeScript and ESM cannot be used without some workarounds.

## Known issues with libraries

- node-fetch: can't be bumped to v3 because it's ESM only. We are currently using v2 which is commonjs and works fine.
- inversify: issues with inversify v7 and higher. We are currently using v6 which is commonjs and works fine.
