import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/index.js',
  dest: 'dist/bundle.js',
  plugins: [
    babel(),
    nodeResolve({ browser: true }),
  ],
  format: 'iife',
}
