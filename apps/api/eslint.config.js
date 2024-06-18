import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nodePlugin from 'eslint-plugin-n';

export default tseslint.config(
  {
    ignores: ['coverage/', 'dist/', 'node_modules/'],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  nodePlugin.configs['flat/recommended-module'],
);
