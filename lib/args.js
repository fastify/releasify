'use strict'

const argv = require('yargs-parser')

module.exports = function parseArgs (args) {
  const parsedArgs = argv(args, {
    string: ['path', 'tag', 'log'],
    boolean: ['help'],
    alias: {
      help: ['h'],
      path: ['p'],
      tag: ['t'],
      log: ['v']
    },
    default: {
      help: false,
      path: process.cwd(),
      tag: 'v*',
      log: 'error'
    }
  })

  // remove the aliases this way
  return Object.assign({}, {
    _: parsedArgs._,
    help: parsedArgs.help,
    path: parsedArgs.path,
    tag: parsedArgs.tag,
    log: parseArgs.log
  })
}
