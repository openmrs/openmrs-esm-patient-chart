const config = require('openmrs/default-rspack-config');

config.cssRuleConfig.exclude = /react-html5-camera-photo/;

module.exports = (env, argv) => {
  const rspackConfig = config(env, argv);
  rspackConfig.module.rules.push({
    test: /\.css$/,
    include: /react-html5-camera-photo/,
    use: ['style-loader', 'css-loader'],
  });
  return rspackConfig;
};
