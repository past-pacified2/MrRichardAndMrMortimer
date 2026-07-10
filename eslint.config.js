import antfu from '@antfu/eslint-config';

export default antfu(
  {
    vue: true,
    typescript: true,
    stylistic: {
      semi: true,
      braceStyle: '1tbs',
    },
  },
  {
    rules: {
      // Prettier owns these formatting concerns.
      'style/operator-linebreak': 'off',
      'style/quote-props': 'off',
      'style/arrow-parens': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
);
