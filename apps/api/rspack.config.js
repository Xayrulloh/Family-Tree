// @ts-check
const { NxAppRspackPlugin } = require('@nx/rspack/app-plugin');
const path = require('node:path');

module.exports = {
  output: {
    path: path.join(__dirname, '../../dist/apps/api'),
  },
  entry: {
    main: './src/main.ts',
  },
  resolve: {
    tsConfig: {
      configFile: path.resolve(__dirname, './tsconfig.app.json'),
      references: 'auto',
    },
  },
  plugins: [
    new NxAppRspackPlugin({
      target: 'node',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      main: './src/main.ts',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
