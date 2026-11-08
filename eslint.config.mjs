import { defineConfig, globalIgnores } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

export default defineConfig([
  expoConfig,
  globalIgnores(["dist/*"]),
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
