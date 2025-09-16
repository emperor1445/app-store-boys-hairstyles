// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // other plugins if you need them (e.g. ['module:react-native-dotenv', {...}])
      // ALWAYS keep the reanimated plugin LAST:
      'react-native-reanimated/plugin'
    ],
  };
};
