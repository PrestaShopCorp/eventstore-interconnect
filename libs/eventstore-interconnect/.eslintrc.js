module.exports = {
  extends: '../../.eslintrc.js',
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: ['@eventstore-interconnect/*', '@eventstore-interconnect'] },
    ],
  },
};
