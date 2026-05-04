import { createModuleFederationConfig } from "@module-federation/rsbuild-plugin";

export default createModuleFederationConfig({
  name: "account",
  exposes: {},
  shareStrategy: "loaded-first",
  shared: {
    react: { singleton: true, requiredVersion: "^19.0.0" },
    "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
    "react-router": { singleton: true, requiredVersion: "^7.0.0" },
    zustand: { singleton: true, requiredVersion: "^5.0.0" },
  },
});
