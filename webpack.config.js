const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'dev');
//const DEMO_DIR = path.resolve(__dirname, 'demo'); 
//'demo': path.resolve(DEMO_DIR, 'demo.js')
const prod = process.argv.indexOf('-p') !== -1;

const config = {
  entry: path.resolve(APP_DIR, 'js', 'index.js'),
  output: {
    path: BUILD_DIR,
    filename: prod ? 'react-things.min.js' : 'react-things.js',
    library: 'react-things',
    libraryTarget: 'umd'
  },
  externals: {
    react: 'react', 
    'react-dom': 'react-dom',
    antd: 'antd',  
    'rest-in-model': 'rest-in-model'
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
    new ExtractTextPlugin('react-things.css', { allChunks: true })
  ]
};

module.exports = config;
