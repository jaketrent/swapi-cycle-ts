module.exports = {
  entry: [
    './index.ts'
  ],
  output: {
    path: __dirname + '/dist',
    filename: 'main.js'
  },
  module: {
    loaders: [
      { test: /\.(js|ts)$/, loaders: ['ts'], exclude: /node_modules/ }
    ]
  }
}
