import buildHelper from '@daybrush/builder';
import svelte from 'rollup-plugin-svelte';

const defaultOptions = {
    tsconfig: '',
    input: './src/index.js',
    external: {
        svelte: 'svelte',
    },
    plugins: [
        svelte(),
    ],
};

export default buildHelper([
    {
        ...defaultOptions,
        output: 'dist/svelte-images.cjs.js',
        format: 'cjs',
    },
    {
        ...defaultOptions,
        output: 'dist/svelte-images.esm.js',
        format: 'es',
    },
]);
