import { join } from "path";

import { addAliases } from "module-alias";

import { readJsonSync } from "./read_json";

interface AliasesOfTsConfig {
  compilerOptions: {
    paths: Record<string, string[]>;
  };
}

const tsConfig = readJsonSync<AliasesOfTsConfig>(
  join(__dirname, "..", "..", "..", "tsconfig.json")
);

addAliases(
  Object.fromEntries(
    Object.entries(tsConfig.compilerOptions.paths).map(([key, value]) => [
      key.slice(0, -2),

      // Removes "./"
      join(__dirname, "../../" + value[0].slice(2, -2)),
    ])
  )
);
