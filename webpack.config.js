const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './powa/static/js/powa/main_entry.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './powa/static/dist')
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader"
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};
