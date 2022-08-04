'use strict'

const argv = require('yargs-parser')
const LocalConf = require('./local-conf')

// TODO --skip-label (don't download the labels from github)

const argsNames = {
  string: ['path',
    'tag',
    'verbose',
    'semver',
    'remote',
    'branch',
    'from-commit',
    'to-commit',
    'npm-access',
    'npm-dist-tag',
    'npm-otp',
    'gh-token',
    'arg'],
  array: ['gh-group-by-label'],
  boolean: ['help',
    'major',
    'dry-run',
    'no-verify',
    'silent',
    'gh-release-edit',
    'gh-release-draft',
    'gh-release-prerelease'
  ]
}

module.exports = function parsedArgs (args) {
  const config = LocalConf()

  const defaultValues = Object.assign({
    help: false,
    path: process.cwd(),
    remote: 'origin',
    branch: 'master',
    verbose: 'warn',
    major: false,
    silent: false,
    'from-commit': 'HEAD',
    'dry-run': false,
    'gh-token': 'GITHUB_OAUTH_TOKEN',
    'gh-release-draft': false,
    'gh-release-prerelease': false,
    'gh-release-edit': false,
    'gh-group-by-label': []
  }, config.store)

  const parsedArgs = argv(args, {
    string: argsNames.string,
    boolean: argsNames.boolean,
    array: argsNames.array,
    alias: {
      help: ['h'],
      path: ['p'],
      tag: ['t'],
      remote: ['r'],
      branch: ['b'],
      'npm-access': ['a'],
      'gh-token': ['k'],
      'gh-release-edit': ['e'],
      'gh-group-by-label': ['l'],
      verbose: ['v'],
      semver: ['s'],
      major: ['m'],
      'no-verify': ['n']
    },
    default: defaultValues,
    configuration: {
      'boolean-negation': false
    }
  })

  const ghToken = process.env[parsedArgs['gh-token']] || parsedArgs['gh-token']

  // remove the aliases this way
  return Object.assign({}, {
    _: parsedArgs._,
    arg: parsedArgs.arg,
    help: toBool(parsedArgs.help),
    path: parsedArgs.path,
    remote: parsedArgs.remote,
    branch: parsedArgs.branch,
    fromCommit: parsedArgs['from-commit'],
    toCommit: parsedArgs['to-commit'],
    noVerify: toBool(parsedArgs['no-verify']),
    silent: toBool(parsedArgs.silent),
    dryRun: toBool(parsedArgs['dry-run']),
    ghToken,
    ghReleaseEdit: toBool(parsedArgs['gh-release-edit']),
    ghReleaseDraft: toBool(parsedArgs['gh-release-draft']),
    ghReleasePrerelease: toBool(parsedArgs['gh-release-prerelease']),
    ghGroupByLabel: parsedArgs['gh-group-by-label'],
    npmAccess: parsedArgs['npm-access'],
    npmDistTag: parsedArgs['npm-dist-tag'],
    npmOtp: parsedArgs['npm-otp'],
    tag: parsedArgs.tag,
    verbose: parsedArgs.verbose,
    semver: parsedArgs.semver,
    major: toBool(parsedArgs.major)
  })
}

function toBool (value) {
  return value && Boolean(value)
}

module.exports.argsNames = argsNames
