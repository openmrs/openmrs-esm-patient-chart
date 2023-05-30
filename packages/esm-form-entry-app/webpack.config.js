const { DefinePlugin, container } = require('webpack');
const { ModuleFederationPlugin } = container;
const { StatsWriterPlugin } = require('webpack-stats-plugin');

const path = require('path');
const { basename, dirname, resolve } = path;
const { name, version, browser, main, peerDependencies } = require('./package.json');
const filename = basename(browser || main);
const root = process.cwd();
const outDir = dirname(browser || main);
const srcFile = resolve(root, browser ? main : types);
const production = 'production';
const mode = process.env.NODE_ENV || production;

function getFrameworkVersion() {
  try {
    const { version } = require('@openmrs/esm-framework/package.json');
    return `^${version}`;
  } catch {
    return '4.x';
  }
}

const frameworkVersion = getFrameworkVersion();

module.exports = {
  entry: resolve(__dirname, 'src/index.ts'),
  target: 'web',
  devtool: mode === production ? 'hidden-nosources-source-map' : 'eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 4200,
  },
  output: {
    publicPath: 'auto',
    path: resolve(root, outDir),
    uniqueName: '_openmrs_esm_form_entry_app',
  },
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new DefinePlugin({
      __VERSION__: mode === production ? JSON.stringify(version) : JSON.stringify(inc(version, 'prerelease', 'local')),
      'process.env.FRAMEWORK_VERSION': JSON.stringify(frameworkVersion),
    }),
    new ModuleFederationPlugin({
      name,
      library: { type: 'var', name: '_openmrs_esm_form_entry_app' },
      filename,
      exposes: {
        './start': srcFile,
      },
      shared: [...Object.keys(peerDependencies), '@openmrs/esm-framework/src/internal'].reduce((obj, depName) => {
        obj[depName] = {
          requiredVersion: peerDependencies[depName] ?? false,
          singleton: true,
          import: depName,
          shareKey: depName,
          shareScope: 'default',
        };
        return obj;
      }, {}),
    }),
    new StatsWriterPlugin({
      filename: `${filename}.buildmanifest.json`,
      stats: {
        all: false,
        chunks: true,
      },
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss'],
    alias: {
      '@openmrs/esm-framework': '@openmrs/esm-framework/src/internal',
    },
  },
};
