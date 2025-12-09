export default  {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          ie: '10',
          edge: '17',
        },
        useBuiltIns: 'usage',
        corejs: '3',
        loose: true,
        modules: 'commonjs',
        forceAllTransforms: true
      },
    ],
  ],
plugins: [
    "transform-remove-strict-mode",
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
        corejs: 3,
      },
    ],
  ],
};