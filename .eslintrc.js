/**
 * @type {import('eslint').ESLint.ConfigData}
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  ignorePatterns: ["node_modules", "lib", "**/*.json", ".eslintrc.js"],
  extends: ["standard-with-typescript", "prettier"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/consistent-indexed-object-style": 0,
    "@typescript-eslint/strict-boolean-expressions": 0,
  },
};
