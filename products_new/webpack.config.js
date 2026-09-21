const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");

const share = mf.share;

const sharedMappings = new mf.SharedMappings();

sharedMappings.register(
  path.join(__dirname, "tsconfig.json"),
  [/* mapped paths to share */]
);

module.exports = {
  output: {
    uniqueName: "productsNew",
    publicPath: "auto"
  },

  optimization: {
    runtimeChunk: false
  },

  experiments: {
    outputModule: true
  },

  resolve: {
    alias: {
      ...sharedMappings.getAliases()
    }
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "productsNew",

      filename: "remoteEntry.js",

      library: {
        type: "module"
      },

      exposes: {
        "./ProductsModule":
          "./src/app/products/products.module.ts"
      },

      shared: share({
        "@angular/core": {
          singleton: true,
          strictVersion: true,
          requiredVersion: "auto"
        },

        "@angular/common": {
          singleton: true,
          strictVersion: true,
          requiredVersion: "auto"
        },

        "@angular/common/http": {
          singleton: true,
          strictVersion: true,
          requiredVersion: "auto"
        },

        "@angular/router": {
          singleton: true,
          strictVersion: true,
          requiredVersion: "auto"
        },

        ...sharedMappings.getDescriptors()
      })
    }),

    sharedMappings.getPlugin()
  ]
};