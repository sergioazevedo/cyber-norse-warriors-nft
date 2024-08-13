import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-ethernal";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  ethernal: {
    disableSync: false, // If set to true, plugin will not sync blocks & txs
    disableTrace: false, // If set to true, plugin won't trace transaction
    uploadAst: false, // If set to true, plugin will upload AST, and you'll be able to use the storage feature (longer sync time though)
    disabled: false, // If set to true, the plugin will be disabled, nohting will be synced, ethernal.push won't do anything either
    verbose: false, // If set to true, will display this config object on start and the full error object,
    workspace: 'Workspace',
    resetOnStart: 'Workspace',
    apiToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVVzZXJJZCI6InFPNjVRQlpzRVlVYmxBWHpmeFRWdkMxajhJcTIiLCJhcGlLZXkiOiJCSEdZVDFNLURSUk1EMlQtR0ZSUTVWRC1KNlgxQlNHXHUwMDAxIiwiaWF0IjoxNzIzNDk1NDQ1fQ.z7LhDKQ7HZQsWmf5HfyWnj-jaXJyyXuYii3IZExveNM",
  },
  networks: {
    localhost: {
      url: `http://127.0.0.1:8545/`,
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
      ],
    }
  }
};

export default config;
