module.exports = {
    root: true,
    env: {
        browser: true,
        es2022: true,
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
    ],
    rules: {
        'semi': ['error', 'always'],
    },
};