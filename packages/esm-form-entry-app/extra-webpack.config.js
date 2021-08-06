const { IgnorePlugin } = require('webpack');
const singleSpaAngularWebpack = require("single-spa-angular/lib/webpack")
  .default;
const { StatsWriterPlugin } = require("webpack-stats-plugin");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");

const packageJson = require("./package.json");

module.exports = (angularWebpackConfig, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(
    angularWebpackConfig,
    options
  );

  for (const dependency of Object.keys(packageJson.peerDependencies)) {
    singleSpaWebpackConfig.externals.push(dependency);
  }

  singleSpaWebpackConfig.plugins.push(new IgnorePlugin(/^\.\/locale$/, /moment$/));
  singleSpaWebpackConfig.plugins.push(new StatsWriterPlugin({
    filename: 'main.js.buildmanifest.json',
    stats: {
      all: false,
      chunks: true,
    },
  }));

  if (singleSpaWebpackConfig.mode === "production") {
    const path = singleSpaWebpackConfig.output.path;
    const publicPath = singleSpaWebpackConfig.output.publicPath;
    
    // NOTE: this does not work with ng server --prod true, because the file does not exist
    singleSpaWebpackConfig.plugins.push(
      new ReplaceInFileWebpackPlugin([
        {
          dir: path,
          files: ["main.js"],
          rules: [
            {
              search: "glyphicons-halflings-regular.eot",
              replace: publicPath + "glyphicons-halflings-regular.eot",
            },
            {
              search: "glyphicons-halflings-regular.woff",
              replace: publicPath + "glyphicons-halflings-regular.woff",
            },
            {
              search: "glyphicons-halflings-regular.ttf",
              replace: publicPath + "glyphicons-halflings-regular.ttf",
            },
            {
              search: "glyphicons-halflings-regular.svg",
              replace: publicPath + "glyphicons-halflings-regular.svg",
            },
          ],
        },
      ])
    );
  }

  return singleSpaWebpackConfig;
};
