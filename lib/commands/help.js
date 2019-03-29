'use strict'

const { needToShowHelp } = require('../man')

module.exports = async function () {
  needToShowHelp('help', { help: true })
}
