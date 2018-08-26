const HtmlWebPackPlugin = require('html-webpack-plugin')

const htmlPlugin = new HtmlWebPackPlugin({
  template: './src/index.html',
  filename: './index.html'
})

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react']
          }
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  },
  resolve: {
    // tells webpack where to look for modules
    // extensions that should be used to resolve modules
    extensions: ['.js', '.jsx', 'less']
  },
  // to ensure that the sourcefile are shown in the browser
  devtool: 'eval-source-map',
  plugins: [htmlPlugin]
}
