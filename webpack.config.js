/*
 * Copyright (c) 2017 Inspireso and/or its affiliates.
 * Licensed under the MIT License.
 *
 */

/* eslint-disable global-require */

const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const pkg = require('./package.json');
const babelConfig = Object.assign({}, pkg.babel, {
  babelrc: false
});

const config = {
  context: path.resolve(__dirname, './src'),

  entry: {
    index: path.resolve(__dirname, './src/index.js')
  },

  // Options affecting the output of the compilation
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'react-extends.js'
  },

  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: [
          'node_modules',
        ],
        loader: 'babel-loader',
        options: babelConfig,
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          name: 'images/[hash]/[name].[ext]',
          limit: 10000
        }
      },
      {
        test: /\.(eot|ttf|wav|svg|woff|woff2|mp3)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[hash]/[name].[ext]',
        },
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(['dist']),
    new ExtractTextPlugin({
      filename: 'css/[name]-[hash].css',
      disable: false,
      allChunks: true
    }),
  ],

  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, "./src")
    ],
    extensions: [".js", ".jsx", ".json", ".css"]
  },

  performance: {
    hints: "warning"
  },
  externals: {
    "jquery": "jQuery"
  }
};

module.exports = config;
