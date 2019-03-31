'use strict'

const argv = require('yargs-parser')

module.exports = function parseArgs (args) {
  const parsedArgs = argv(args, {
    boolean: ['help'],
    alias: {
      help: ['h']
    },
    default: {
      help: false
    }
  })

  // remove the aliases this way
  return Object.assign({}, {
    _: parsedArgs._,
    help: parsedArgs.help
  })
}
