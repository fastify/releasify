'use strict'

const argv = require('yargs-parser')

// TODO --skip-label (don't download the labels from github)

module.exports = function parsedArgs (args) {
  const parsedArgs = argv(args, {
    string: ['path', 'tag', 'verbose', 'semver', 'remote', 'branch', 'npm-access', 'npm-dist-tag', 'npm-otp', 'gh-token', 'gh-release-draft', 'gh-release-prerelease'],
    boolean: ['help', 'major', 'dry-run', 'no-verify', 'gh-release-edit'],
    alias: {
      help: ['h'],
      path: ['p'],
      tag: ['t'],
      remote: ['r'],
      branch: ['b'],
      'npm-access': ['a'],
      'gh-token': ['k'],
      'gh-release-edit': ['e'],
      verbose: ['v'],
      semver: ['s'],
      major: ['m'],
      'no-verify': ['n']
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
      'gh-release-prerelease': false,
      'gh-release-edit': false
    },
    configuration: {
      'boolean-negation': false
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
    noVerify: parsedArgs['no-verify'],
    dryRun: parsedArgs['dry-run'],
    ghToken,
    ghReleaseEdit: parsedArgs['gh-release-edit'],
    ghReleaseDraft: parsedArgs['gh-release-draft'],
    ghReleasePrerelease: parsedArgs['gh-release-prerelease'],
    npmAccess: parsedArgs['npm-access'],
    npmDistTag: parsedArgs['npm-dist-tag'],
    npmOtp: parsedArgs['npm-otp'],
    tag: parsedArgs.tag,
    verbose: parsedArgs.verbose,
    semver: parsedArgs.semver,
    major: parsedArgs.major
  })
}
