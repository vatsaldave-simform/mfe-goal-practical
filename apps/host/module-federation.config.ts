import { createModuleFederationConfig } from "@module-federation/rsbuild-plugin";

const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:3001";
const accountUrl = process.env.ACCOUNT_URL || "http://localhost:3002";

export default createModuleFederationConfig({
  name: "host",
  remotes: {
    storefront: `storefront@${storefrontUrl}/mf-manifest.json`,
    account: `account@${accountUrl}/mf-manifest.json`,
  },
  shareStrategy: "loaded-first",
  shared: {
    react: { singleton: true, requiredVersion: "^19.0.0" },
    "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
    "react-router": { singleton: true, requiredVersion: "^7.0.0" },
    zustand: { singleton: true, requiredVersion: "^5.0.0" },
    "@mfe/store": { singleton: true, requiredVersion: "workspace:*" },
    "@mfe/api": { singleton: true, requiredVersion: "workspace:*" },
    sonner: { singleton: true, requiredVersion: "^2.0.0" },
  },
});
