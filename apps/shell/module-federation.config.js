const { ModuleFederationConfig } = require('@nx/module-federation');

/**
 * @type {import('@nx/module-federation').ModuleFederationConfig}
 */
const config = {
  name: 'shell',
  remotes: ['microfrontend'],
};

module.exports = config;