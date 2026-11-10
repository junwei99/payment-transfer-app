import { defineConfig, globalIgnores } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";
import { fileURLToPath } from "node:url";

export default defineConfig([
  expoConfig,
  globalIgnores(["dist/*"]),
  {
    files: ["services/mock-api/**/*.ts"],
    settings: {
      "import/resolver": {
        typescript: {
          project: fileURLToPath(
            new URL("./services/mock-api/tsconfig.json", import.meta.url),
          ),
        },
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.d.ts"],
    rules: {
      curly: ["error", "all"],
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionExpression[parent.kind!='constructor']",
          message: "Use an arrow function.",
        },
      ],
    },
  },
]);
