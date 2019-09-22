const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')
const os = require('os')

//https://webpack.js.org/plugins/html-webpack-plugin/
//https://www.npmjs.com/package/html-webpack-plugin
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.resolve(__dirname, 'src', 'index.html'),
  filename: 'index.html',
  inject: 'body',
  minify: {
    collapseWhitespace: true,
    minifyCSS: true
  }
})

const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const WebpackCleanupPluginConfig = new WebpackCleanupPlugin({})

//merge({ ... }) isn't required here, but it enables autocomplete
module.exports = merge({
  entry: path.join(__dirname, 'src', 'main.ts'),
  output: {
    filename: '[contenthash].js',
    path: path.join(__dirname, 'public')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },

  plugins: [
    WebpackCleanupPluginConfig,
    HTMLWebpackPluginConfig,
    new webpack.DefinePlugin({
      __BUILD_INFO__: JSON.stringify({
        version: require('./package').version,
        date: new Date().toString(),
        os: `${os.hostname()}@${os.type()} ${os.release()} ${os.arch()}`
      })
    })
  ],

  module: {
    rules: [
      //https://www.typescriptlang.org/docs/handbook/react-&-webpack.html (ignore the react part)
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      },

      //https://webpack.js.org/loaders/css-loader/
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },

      //https://webpack.js.org/loaders/file-loader/
      {
        test: /\.(gltf|mp3|svg|glb|png|jpe?g)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets',
              name: '[sha256:hash:base64:16].[ext]'
            }
          }
        ]
      }
    ]
  }
})
