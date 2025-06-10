const { DefinePlugin, container } = require('webpack');
const { ModuleFederationPlugin } = container;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const { existsSync, statSync } = require('fs');
const { inc } = require('semver');

function getFrameworkVersion() {
  try {
    const { version } = require('@openmrs/esm-framework/package.json');
    return `^${version}`;
  } catch {
    return '5.x';
  }
}

/**
 * @param {string} name the name of the file
 * @returns true if file exists and is a file
 */
function fileExistsSync(name) {
  return existsSync(name) && statSync(name).isFile();
}

const path = require('path');
const { basename, dirname, resolve } = path;
const { name, version, browser, main, peerDependencies, types } = require('./package.json');
const filename = basename(browser || main);
const root = process.cwd();
const outDir = dirname(browser || main);
const srcFile = resolve(root, browser ? main : types);
const production = 'production';
const mode = process.env.NODE_ENV || production;
const frameworkVersion = getFrameworkVersion();
const routes = resolve(root, 'src', 'routes.json');
const hasRoutesDefined = fileExistsSync(routes);

if (!hasRoutesDefined) {
  console.error(
    'This app does not define a routes.json. This file is required for this app to be used by the OpenMRS 3 App Shell.',
  );
  // key-smash error code
  // so this (hopefully) doesn't interfere with Webpack-specific exit codes
  process.exit(9819023573289);
}

module.exports = {
  entry: resolve(__dirname, 'src/index.ts'),
  target: 'web',
  devtool: mode === production ? 'hidden-nosources-source-map' : 'eval-source-map',
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 4200,
  },
  output: {
    publicPath: 'auto',
    path: resolve(root, outDir),
    uniqueName: '_openmrs_esm_form_entry_app',
    scriptType: 'text/javascript',
  },
  optimization: {
    runtimeChunk: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  decorators: true,
                },
                transform: {
                  legacyDecorator: true,
                  decoratorMetadata: true,
                },
                target: 'es2020',
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
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
    hasRoutesDefined
      ? new CopyWebpackPlugin({
          patterns: [
            {
              from: routes,
              transform: {
                transformer: (content) =>
                  JSON.stringify(
                    Object.assign({}, JSON.parse(content.toString()), {
                      version: mode === production ? version : inc(version, 'prerelease', 'local'),
                    }),
                  ),
              },
            },
          ],
        })
      : {},
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss'],
    alias: {
      '@openmrs/esm-framework': '@openmrs/esm-framework/src/internal',
    },
  },
};
