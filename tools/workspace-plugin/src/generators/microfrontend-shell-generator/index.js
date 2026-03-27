// Nx loads generators via Node require(). This shim enables loading the TS implementation.
require('ts-node/register/transpile-only');

module.exports = require('./index.ts');

