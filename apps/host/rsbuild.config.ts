import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import moduleFederationConfig from "./module-federation.config";

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(moduleFederationConfig)],
  source: {
    define: {
      "process.env.PUBLIC_API_URL": JSON.stringify(
        process.env.PUBLIC_API_URL ?? "",
      ),
    },
  },
  server: {
    port: 3000,
  },
});
