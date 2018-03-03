const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'dev');
const DEMO_DIR = path.resolve(__dirname, 'demo');
const prod = process.argv.indexOf('-p') !== -1;

const config = {
  entry: {
    'react-things': path.resolve(APP_DIR, 'js', 'index.js'),
    'demo': path.resolve(DEMO_DIR, 'demo.js')
  },
  output: {
    path: BUILD_DIR,
    filename: prod ? '[name].min.js' : '[name].js',
    library: 'react-things',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: path.resolve(__dirname, 'node_modules'),
        loader: 'babel-loader'
      },
      {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css']
  },
  plugins: [
    new ExtractTextPlugin('[name].css'), // CSS will be extracted to this bundle file -> ADDED IN THIS STEP
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom'
    })
  ],
  devServer: {
    port: 3333
  }
};

module.exports = config;
