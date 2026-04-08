import adapter from '@sveltejs/adapter-node'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
    // eslint-disable-next-line e18e/prefer-static-regex
    runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
  },
  kit: { adapter: adapter() },
}

export default config
