import defineConfig from '@antfu/eslint-config';

export default defineConfig(
  { vue: true, unocss: true, ignores: ['src/plugins/leaflet/**'] },
  {
    rules: {
      'no-underscore-dangle': 'off',
      'no-console': 'warn',

      'vue/multi-word-component-names': [
        'warn',
        {
          ignores: ['index', 'App', 'Register', '[id]', '[url]']
        }
      ],
      'vue/component-name-in-template-casing': [
        'warn',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: ['/^icon-/', 'primitive']
        }
      ],

      'style/no-multiple-empty-lines': 'warn',
      'style/semi': ['warn', 'always'],
      'style/comma-dangle': ['warn', 'never'],
      'style/arrow-parens': ['warn', 'as-needed'],
      'style/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false
          }
        }
      ],
      'style/brace-style': ['error', '1tbs'],

      'antfu/if-newline': 'warn'
    }
  }
);
