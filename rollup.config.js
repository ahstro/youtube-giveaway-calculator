import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/index.js',
  dest: 'dist/index.js',
  plugins: [
    babel(),
    nodeResolve({ browser: true }),
    uglify(),
  ],
  format: 'iife',
}
