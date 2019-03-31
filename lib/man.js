'use strict'

const path = require('path')
const { readFileSync } = require('fs')

module.exports.needToShowHelp = function (file, opts) {
  if (opts.help || opts._.length > 0) {
    console.log(readFileSync(path.join(__dirname, '..', 'man', file), 'utf8'))
    return true
  }
  return false
}
