// frontend/eslint.config.mjs
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error", // critical safety net
      "react-hooks/exhaustive-deps": "off"   // avoid noise
    }
  },
  { ignores: ["build/", "dist/", "node_modules/"] }
];
