const esbuild = require('esbuild');
const glob = require('glob');
const fs = require('fs').promises;
const path = require('path');

async function transpileNodeModules() {
    // Get package.json file of mdb-reader module
    const packageJsonPath = 'packages/oslo-extractor-uml-ea/node_modules/mdb-reader/package.json';

    const json = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    // Skip unless the type of the package is ESM
    if (!json.name || json.type !== 'module') {
        return;
    }

    console.log(`🦀 Transpiling ${json.name}...`);

    const dir = path.dirname(packageJsonPath);

    // Get all .js files unless they are in a nested node_modules folder
    const entryPoints = glob.sync(`${dir}/**/*.js`).filter(
        (d) => !d.includes(`${dir}/node_modules/`)
    );

    if (entryPoints.length === 0) {
        return;
    }

    // Transpile each .js file
    for (const file of entryPoints) {
        await esbuild.build({
            entryPoints: [file],
            allowOverwrite: true,
            outfile: file,
            format: 'cjs',
            platform: 'node',
            target: 'node12',
            sourcemap: false,
            bundle: false,
        });
    }

    // Change the type of the package to commonjs
    json.type = 'commonjs';
    await fs.writeFile(packageJsonPath, JSON.stringify(json, null, 2));
}

transpileNodeModules();