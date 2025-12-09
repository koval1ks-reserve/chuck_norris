module.exports = {
  plugins: [
    require('postcss-preset-env')({
      stage: 3,
      browsers: ['ie >= 10'],
      autoprefixer: {
            grid: 'autoplace'
        }
    }),
  ],
};