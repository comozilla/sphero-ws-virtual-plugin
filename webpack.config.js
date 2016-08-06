const webpack = require("webpack");

module.exports = {
  cache: true,
  entry: "./virtual/main.js",
  output: {
    path: __dirname,
    filename: "./virtual/build/bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel",
        query: {
          cacheDirectory: true,
          presets: ["es2015"]
        }
      }
    ]
  },
  resolve: {
    modulesDirectories: ["web_modules", "node_modules", "bower_components"]
  },
  plugins: [new webpack.ResolverPlugin(
    new webpack.ResolverPlugin
      .DirectoryDescriptionFilePlugin("package.json", ["main"])
  )]
};
