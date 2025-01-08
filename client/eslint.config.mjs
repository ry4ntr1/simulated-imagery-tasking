// .eslintrc.js (or eslint.config.js in ESLint 8.23+)
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
	// 1) Apply to JS/JSX files
	{
		files: ["**/*.{js,mjs,cjs,jsx}"],
		languageOptions: {
			globals: globals.browser,
		},
		// 2) Override or disable specific rules:
		rules: {
			// Turn off the 'react-hooks/exhaustive-deps' rule:
			"react-hooks/exhaustive-deps": "off",
			// Example of other overrides if needed:
			// "react-hooks/rules-of-hooks": "error",
			// "no-console": "warn",
		},
	},

	// 3) Bring in recommended base configs:
	pluginJs.configs.recommended,
	pluginReact.configs.flat.recommended,
];
