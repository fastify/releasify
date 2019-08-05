'use strict'

const Conf = require('conf')

const confSettings = {
  configName: 'releasify',
  projectName: 'releasify',
  encryptionKey: 'fastify-team-is-awesome'
}

module.exports = function localConfig () {
  return new Conf(confSettings)
}
