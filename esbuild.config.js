const esbuild = require('esbuild');
const {dtsPlugin} = require('esbuild-plugin-d.ts');

esbuild
    .build({
        entryPoints: ['./src/spectre.ts'],
        bundle: true,
        platform: 'node',
        outdir: './dist',
        format: 'esm',
        target: 'node20',
        treeShaking: true,
        minify: true,
        loader: {
            '.ts': 'ts',
        },
        plugins: [dtsPlugin()],
        splitting: true,
        metafile: true,
    })
    .catch(() => process.exit(1));
