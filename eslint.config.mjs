import nx from '@nx/eslint-plugin';

export default [
  // Base Nx configs
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...nx.configs['flat/angular'],

  // Global ignores
  {
    ignores: ['**/dist', '**/out-tsc'],
  },

  // Nx module boundaries (TS + JS)
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },

  // TypeScript-specific rules
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    rules: {
      // Angular
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/no-empty-lifecycle-method': 'off',

      // TS rules
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/ban-ts-comment': 'off', // fixes @ts-ignore error

      // ❌ removed: ban-types (deprecated / not always available)
    },
  },

  // General JS/TS rules
  {
    files: ['**/*.{ts,tsx,js,jsx,cjs,mjs}'],
    rules: {
      'no-useless-escape': 'off',
      'prefer-const': 'off',
      'no-warning-comments': 'off',
    },
  },
];