const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: './'
  },
  module: {
    rules: [
      { test: /\.m?js$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' })
  ],
  devServer: {
    port: 8080,
    open: true,
    static: path.join(__dirname, 'dist'),
    hot: true,
    historyApiFallback: true
  }
};
