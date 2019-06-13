'use strict'

const Conf = require('conf')

module.exports = async function (args) {
  // TODO
  const config = new Conf({
    configName: 'releasify',
    projectName: 'releasify',
    encryptionKey: 'fastify-team-is-awesome'
  })
  config.set('gh-token', 'A TOKEN')
  console.log(config.path)
}
