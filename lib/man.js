'use strict'

const path = require('node:path')
const { readFileSync } = require('node:fs')

module.exports.needToShowHelp = function (file, opts) {
  if (opts.help || opts._.length > 0) {
    console.log(readFileSync(path.join(__dirname, '..', 'man', file), 'utf8'))
    return true
  }
  return false
}
