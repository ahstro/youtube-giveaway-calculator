import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import postcss from 'rollup-plugin-postcss'
import nodeResolve from 'rollup-plugin-node-resolve'
import cssnext from 'postcss-cssnext'

export default {
  entry: 'src/index.js',
  dest: 'dist/index.js',
  plugins: [
    postcss({
      plugins: [
        cssnext(),
      ],
    }),
    babel(),
    nodeResolve({ browser: true }),
    uglify(),
  ],
  format: 'iife',
}
