import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  action: {
    dependencies: [
      { ext: "contextMenu", id: "contextMenu" },
      { ext: "spacepack", id: "spacepack" },
      { id: "react" },
      { ext: "common", id: "ErrorBoundary" }
    ],
    entrypoint: true
  },

  constants: {},
  modal: {}
};
