import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import moduleFederationConfig from "./module-federation.config";

const assetPrefix = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.PUBLIC_URL || undefined;

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(moduleFederationConfig)],
  output: {
    assetPrefix,
  },
  source: {
    define: {
      "process.env.PUBLIC_API_URL": JSON.stringify(
        process.env.PUBLIC_API_URL || "http://localhost:3003",
      ),
    },
  },
  server: {
    port: 3002,
  },
});
