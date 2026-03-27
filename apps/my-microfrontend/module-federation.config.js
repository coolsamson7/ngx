module.exports = {
  name: 'my-microfrontend',
  exposes: {
    './Module':
      'apps/my-microfrontend/src/app/remote-entry/remote-entry.module.ts',
  },
};
