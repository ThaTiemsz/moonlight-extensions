import type { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: ".clickableWrapper",
    replace: {
      match: /className:.{1,2}\.originalLink,href:(.{1,2}),/,
      replacement: (orig, src) => {
        return `${orig}title:require("imgTitle_handler").handle(${src}),`;
      }
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  handler: {}
};
