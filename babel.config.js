module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          extensions: [".ios.js", ".android.js", ".js", ".json", ".ts", ".tsx"],
          alias: {
            components: "./app/components",
            constants: "./app/constants",
            feature: "./app/feature",
            modules: "./app/modules",
            screens: "./app/screens",
            api: "./app/api",
            navigation: "./app/navigation",
            store: "./app/store",
          },
        },
      ],
      "react-native-reanimated/plugin",
      ["inline-import", { extensions: [".sql"] }],
    ],
  };
};
