import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import moduleFederationConfig from "./module-federation.config";

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(moduleFederationConfig)],
  source: {
    define: {
      "process.env.PUBLIC_API_URL": JSON.stringify(
        process.env.PUBLIC_API_URL || "http://localhost:3003",
      ),
      "process.env.STOREFRONT_URL": JSON.stringify(
        process.env.STOREFRONT_URL || "http://localhost:3001",
      ),
      "process.env.ACCOUNT_URL": JSON.stringify(
        process.env.ACCOUNT_URL || "http://localhost:3002",
      ),
    },
  },
  server: {
    port: 3000,
  },
});
