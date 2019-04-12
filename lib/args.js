'use strict'

const argv = require('yargs-parser')

module.exports = function parsedArgs (args) {
  const parsedArgs = argv(args, {
    string: ['path', 'tag', 'verbose', 'semver', 'remote', 'branch', 'npm-access', 'npm-tag', 'gh-token', 'gh-release-draft', 'gh-release-prerelease'],
    boolean: ['help', 'major', 'dry-run'],
    alias: {
      help: ['h'],
      path: ['p'],
      tag: ['t'],
      remote: ['r'],
      branch: ['b'],
      'npm-access': ['a'],
      'gh-token': ['k'],
      verbose: ['v'],
      semver: ['s'],
      major: ['m']
    },
    default: {
      help: false,
      path: process.cwd(),
      remote: 'origin',
      branch: 'master',
      verbose: 'warn',
      major: false,
      'dry-run': false,
      'gh-token': 'GITHUB_OAUTH_TOKEN',
      'gh-release-draft': false,
      'gh-release-prerelease': false
    }
  })

  const ghToken = process.env[parsedArgs['gh-token']] || parsedArgs['gh-token']

  // remove the aliases this way
  return Object.assign({}, {
    _: parsedArgs._,
    help: parsedArgs.help,
    path: parsedArgs.path,
    remote: parsedArgs.remote,
    branch: parsedArgs.branch,
    dryRun: parsedArgs['dry-run'],
    ghToken,
    ghReleaseDraft: parsedArgs['gh-release-draft'],
    ghReleasePrerelease: parsedArgs['gh-release-prerelease'],
    npmAccess: parsedArgs['npm-access'],
    npmTag: parsedArgs['npm-tag'],
    tag: parsedArgs.tag,
    verbose: parsedArgs.verbose,
    semver: parsedArgs.semver,
    major: parsedArgs.major
  })
}
