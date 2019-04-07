'use strict'

const argv = require('yargs-parser')

module.exports = function parseArgs (args) {
  const parsedArgs = argv(args, {
    string: ['path', 'tag', 'verbose', 'semver'],
    boolean: ['help'],
    alias: {
      help: ['h'],
      path: ['p'],
      tag: ['t'],
      verbose: ['v'],
      semver: ['s']
    },
    default: {
      help: false,
      path: process.cwd(),
      tag: 'v*',
      verbose: 'error'
    }
  })

  // remove the aliases this way
  return Object.assign({}, {
    _: parsedArgs._,
    help: parsedArgs.help,
    path: parsedArgs.path,
    tag: parsedArgs.tag,
    verbose: parsedArgs.verbose,
    semver: parsedArgs.semver
  })
}
