const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')
const webpack = require('webpack')
const fs = require('fs')

module.exports = merge(common, {
  mode: 'development',

  devtool: 'source-map',

  //https://webpack.js.org/configuration/dev-server/
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
    clientLogLevel: 'warning'
  },

  plugins: [
    new webpack.DefinePlugin({
      __DEVELOPMENT__: JSON.stringify(true)
    })
  ],

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      }
    ]
  }
})
