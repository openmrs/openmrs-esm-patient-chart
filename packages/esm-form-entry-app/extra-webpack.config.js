const { IgnorePlugin, DefinePlugin } = require('webpack');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const { basename } = require('path');
const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;

const packageJson = require('./package.json');

function getFrameworkVersion() {
  try {
    const { version } = require('@openmrs/esm-framework/package.json');
    return `^${version}`;
  } catch {
    return '4.x';
  }
}

module.exports = (angularWebpackConfig, options) => {
  const filename = basename(packageJson.browser || packageJson.main);
  const frameworkVersion = getFrameworkVersion();
  const singleSpaWebpackConfig = singleSpaAngularWebpack(angularWebpackConfig, options);

  singleSpaWebpackConfig.output.filename = filename;

  for (const dependency of Object.keys(packageJson.peerDependencies)) {
    singleSpaWebpackConfig.externals.push(dependency);
  }

  singleSpaWebpackConfig.plugins.push(
    new IgnorePlugin(/^\.\/locale$/, /moment$/),
    new DefinePlugin({
      'process.env.FRAMEWORK_VERSION': JSON.stringify(frameworkVersion),
    }),
    new StatsWriterPlugin({
      filename: `${filename}.buildmanifest.json`,
      stats: {
        all: false,
        chunks: true,
      },
    }),
  );

  return singleSpaWebpackConfig;
};
