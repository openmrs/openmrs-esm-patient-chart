const cfgCreator = require('openmrs/default-webpack-config');
module.exports = (env, argv) => {
  const config = cfgCreator(env, argv);
  const cssLoaderMode = (resourcePath) => {
    if (/.*react-html5-camera-photo\/build\/css\/index.css/i.test(resourcePath) || /styles.css$/i.test(resourcePath)) {
      return 'global';
    }
    return 'local';
  };
  config.module.rules[1].use[1].options.modules['mode'] = cssLoaderMode;
  config.module.rules[2].use[1].options.modules['mode'] = cssLoaderMode;
  return config;
};
