import { createModuleFederationConfig } from "@module-federation/rsbuild-plugin";

export default createModuleFederationConfig({
  name: "account",
  exposes: {
    "./App": "./src/App.tsx",
    "./AuthApp": "./src/AuthApp.tsx",
    "./OrdersApp": "./src/OrdersApp.tsx",
  },
  shareStrategy: "loaded-first",
  shared: {
    react: { singleton: true, requiredVersion: "^19.0.0" },
    "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
    "react-router": { singleton: true, requiredVersion: "^7.0.0" },
    zustand: { singleton: true, requiredVersion: "^5.0.0" },
    "@mfe/store": { singleton: true, requiredVersion: "workspace:*" },
    "@mfe/api": { singleton: true, requiredVersion: "workspace:*" },
  },
});
