import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(_on, _config) {},
    watchForFileChanges: true,
    defaultBrowser: "electron",
    projectId: "z9f1hi",
  },
});
