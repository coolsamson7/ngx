
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");

module.exports = {
  output: { uniqueName: "portal", publicPath: "auto" },
  optimization: { runtimeChunk: false },
  plugins: [
    new ModuleFederationPlugin({
      name: "portal",
      filename: "remoteEntry.js",
      exposes: { "./Module": "./libs/portal/src/index.ts" },
      shared: mf.share({
        "@angular/core": { singleton: true, strictVersion: true },
        "@angular/common": { singleton: true, strictVersion: true },
        "@angular/router": { singleton: true, strictVersion: true }
      })
    })
  ]
};