module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'semi': 'off',
    'no-trailing-spaces': 'off',
    'eol-last': 'off',
    'space-before-function-paren': 'off',
    'no-tabs': 'off',
    'indent': 'off',
		"@typescript-eslint/no-this-alias": ["off"]
  }
};
