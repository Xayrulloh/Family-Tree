// @ts-check
const { NxAppRspackPlugin } = require('@nx/rspack/app-plugin');
const { join } = require('node:path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api'),
  },
  entry: {
    main: './src/main.ts',
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
