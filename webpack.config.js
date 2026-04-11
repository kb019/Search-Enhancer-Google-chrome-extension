const webpack = require("webpack");
require("dotenv").config({ path: "./.env" });

module.exports = (config) => {
  return {
    mode: "production",
    entry: "./src/scripts/content.js",
    target: "web",
    output: {
      filename: "content.bundle.js",
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(process.env),
      }),
    ],
  };
};
