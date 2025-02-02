import type { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  replacer: {
    dependencies: [{ ext: "commands", id: "commands" }],
    entrypoint: true
  }
};
