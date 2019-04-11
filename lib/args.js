'use strict'

const argv = require('yargs-parser')

module.exports = function parseArgs (args) {
// TODO add params
/**
 * dry-run
 * info
 * debug
 * warn
 *
 * branch
 *
 * npm-tag
 *
 * git-remote
 *
 * gh-token
 * gh-release-draft false
 * gh-release-prerelease  false
 */

  const parsedArgs = argv(args, {
    string: ['path', 'tag', 'verbose', 'semver'],
    boolean: ['help', 'major'],
    alias: {
      help: ['h'],
      path: ['p'],
      tag: ['t'],
      verbose: ['v'],
      semver: ['s'],
      major: ['m']
    },
    default: {
      help: false,
      path: process.cwd(),
      verbose: 'warn',
      major: false
    }
  })

  // remove the aliases this way
  return Object.assign({}, {
    _: parsedArgs._,
    help: parsedArgs.help,
    path: parsedArgs.path,
    tag: parsedArgs.tag,
    verbose: parsedArgs.verbose,
    semver: parsedArgs.semver,
    major: parsedArgs.major
  })
}
