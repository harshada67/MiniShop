const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");

const share = mf.share;

const sharedMappings = new mf.SharedMappings();

sharedMappings.register(
  path.join(__dirname, "tsconfig.json"),
  []
);

module.exports = {
  output: {
    uniqueName: "shell",
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
      name: "shell",

      library: {
        type: "module"
      },

      remoteType: "module",

      remotes: {
        // products: "http://localhost:4201/remoteEntry.js",
        cart: "http://localhost:4202/remoteEntry.js",
         productsNew: "http://localhost:4203/remoteEntry.js",
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