module.exports = {
  name: 'my-shell',
  remotes: ['my-microfrontend'],
  exposes: {
    './Module': 'apps/my-shell/src/app/shell.module.ts',
  },
  shared: (libraryName, sharedConfig) => {
      return sharedConfig;
    }
};
