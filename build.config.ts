import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [{ input: "./src/index.ts" }],
  rollup: {
    emitCJS: true,
  },
  clean: true,
  declaration: true,
  outDir: "lib",
});
