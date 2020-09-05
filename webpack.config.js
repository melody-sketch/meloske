const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

var main = {
  mode: "development",
  target: "electron-main",
  entry: path.join(__dirname, "src", "index"),
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      {
        test: /.ts?$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [path.resolve(__dirname, "node_modules")],
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
};

var renderer = {
  mode: "development",
  target: "electron-renderer",
  entry: path.join(__dirname, "src", "renderer", "index"),
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist", "scripts"),
  },
  resolve: {
    extensions: [".json", ".js", ".jsx", ".css", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts)$/,
        use: ["ts-loader"],
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules"),
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "**/*.html",
          to: ".",
          context: "src/renderer",
        },
      ],
    }),
  ],
};

module.exports = [main, renderer];
