module.exports = {
  env: {
    node: true,
    browser: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  globals: {
    chrome: true,
    Vue: 'readonly',
  },
  plugins: [
    'vue',
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ], // required to lint *.vue files
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
  ],
  rules: {
    'array-bracket-spacing': [ 'warn', 'always' ],
    'brace-style': [ 'warn', '1tbs' ],
    'curly': ['warn', 'all'],
    'eol-last': [ 'error', 'always' ],
    'jsx-quotes': [ 'error', 'prefer-double' ],
    'keyword-spacing': ['warn', { 'before': true, 'after': true }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'warn',
    'object-curly-spacing': ['warn', 'always'],
    'template-curly-spacing': [ 'warn', 'always' ],
    'vue/max-attributes-per-line': [ 'error', { singleline: 2 } ],
    'vue/no-unused-components': 'warn',
    'vue/script-indent': [ 'error', 2, { baseIndent: 1 } ],
    'vue/no-v-html': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/camelcase': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint',
      ],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
    },
  ],
}
