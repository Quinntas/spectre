const esbuild = require('esbuild');
const {dtsPlugin} = require("esbuild-plugin-d.ts");

esbuild.build({
    entryPoints: ['./src/spectre.ts'],
    bundle: true,
    platform: 'node',
    outfile: './index.cjs',
    format: 'cjs',
    sourcemap: true,
    target: 'node16',
    loader: {
        '.ts': 'ts',
    },
    plugins: [dtsPlugin()]
}).catch(() => process.exit(1));
