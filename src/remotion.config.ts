import { Config } from 'remotion';

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules ?? []),
        {
          test: /\.js$/,
          type: 'javascript/auto',
        },
      ],
    },
    resolve: {
      ...currentConfiguration.resolve,
      fallback: {
        ...currentConfiguration.resolve?.fallback,
        fs: false,
        path: false,
        os: false,
      },
    },
  };
});

Config.Rendering.setImageFormat('png');
Config.Output.setOverwriteOutput(true);