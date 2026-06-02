# External libraries

This project is wrtitten in TypeScript and commonjs. Libraries that are written in TypeScript and commonjs can be used without any problems. Libraries that are written in JavaScript and commonjs can also be used without any problems. Libraries that are written in JavaScript and ESM can be used with some limitations. Libraries that are written in TypeScript and ESM cannot be used without some workarounds. Some other libraries we do not bump deliberately because of known issues with newer versions or because of the effort required to upgrade to newer versions for little gain. Below is a list of libraries that we are using and any known issues with them.

## Known issues with libraries

- node-fetch: can't be bumped to v3 because it's ESM only. We are currently using v2 which is commonjs and works fine.
- inversify: issues with inversify v7 and higher. We are currently using v6 which is commonjs and works fine.
- jest: issues with jest v30 and higher. Relatively big effort to upgrade to v30 for little gain. leaving this one out for now
- eslint: Relatively big effort to upgrade to v8 for little gain. leaving this one out for now
