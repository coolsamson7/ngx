module.exports = {
  name: 'my-shell',
  remotes: [],
  exposes: {
    './Module': 'apps/my-shell/src/app/shell.module.ts',
  },
};
