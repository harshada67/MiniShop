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
    uniqueName: "cart",
    publicPath: "auto"
  },

  optimization: {
    runtimeChunk: false
  },

  // Cart is an ES Module remote
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
      name: "cart",

      filename: "remoteEntry.js",

      // Important for ES Module Federation
      library: {
        type: "module"
      },

      // Expose CartModule to Shell
      exposes: {
        "./CartModule": "./src/app/cart/cart.module.ts"
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