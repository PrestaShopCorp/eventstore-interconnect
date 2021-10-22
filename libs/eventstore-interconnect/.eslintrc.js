module.exports = {
  extends: '../../.eslintrc.js',
  parserOptions: {
    project: '../../tsconfig.json',
    sourceType: 'module',
  },
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: ['@eventstore-interconnect/*', '@eventstore-interconnect'] },
    ],
  },
};
