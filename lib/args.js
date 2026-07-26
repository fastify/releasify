'use strict'

const { parseArgs } = require('util')
const LocalConf = require('./local-conf')

const optionsConfig = {
  help: { type: 'boolean', short: 'h' },
  major: { type: 'boolean', short: 'm' },
  'dry-run': { type: 'boolean' },
  'no-verify': { type: 'boolean', short: 'n' },
  silent: { type: 'boolean' },
  'gh-release-edit': { type: 'boolean', short: 'e' },
  'gh-release-draft': { type: 'boolean' },
  'gh-release-prerelease': { type: 'boolean' },
  'gh-release-body': { type: 'boolean', short: 'x' },
  path: { type: 'string', short: 'p' },
  tag: { type: 'string', short: 't' },
  verbose: { type: 'string', short: 'v' },
  semver: { type: 'string', short: 's' },
  remote: { type: 'string', short: 'r' },
  branch: { type: 'string', short: 'b' },
  'from-commit': { type: 'string' },
  'to-commit': { type: 'string' },
  'npm-access': { type: 'string', short: 'a' },
  'npm-dist-tag': { type: 'string' },
  'npm-otp': { type: 'string' },
  'npm-browser-auth': { type: 'boolean' },
  'gh-token': { type: 'string', short: 'k' },
  arg: { type: 'string' },
  'gh-group-by-label': { type: 'string', short: 'l', multiple: true }
}

module.exports = function parsedArgs (args) {
  const config = LocalConf()

  const defaultValues = Object.assign({
    help: false,
    path: process.cwd(),
    remote: 'origin',
    branch: 'main',
    verbose: 'warn',
    major: false,
    silent: false,
    'from-commit': 'HEAD',
    'dry-run': false,
    'gh-token': 'GITHUB_OAUTH_TOKEN',
    'gh-release-draft': false,
    'gh-release-prerelease': false,
    'gh-release-edit': false,
    'gh-release-body': false,
    'gh-group-by-label': [],
    'npm-browser-auth': false
  }, config.store)

  const { values, positionals } = parseArgs({
    args,
    options: optionsConfig,
    allowPositionals: true,
    strict: false
  })

  // Convert string 'true'/'false' to actual booleans for boolean options
  // and strip quotes from string values
  for (const [opt, config] of Object.entries(optionsConfig)) {
    if (values[opt] !== undefined && typeof values[opt] === 'string') {
      if (config.type === 'boolean') {
        if (values[opt] === 'true') {
          values[opt] = true
        } else if (values[opt] === 'false') {
          values[opt] = false
        }
      } else if (config.type === 'string') {
        // Strip surrounding quotes if present
        const val = values[opt]
        if (val.startsWith('"') && val.endsWith('"')) {
          values[opt] = val.slice(1, -1)
        }
      }
    }
  }

  // Apply defaults for any option not provided
  for (const key of Object.keys(defaultValues)) {
    if (values[key] === undefined) {
      values[key] = defaultValues[key]
    }
  }

  const ghToken = process.env[values['gh-token']] || values['gh-token']

  // Map kebab-case keys to camelCase return object
  return {
    _: positionals,
    arg: values.arg,
    help: values.help,
    path: values.path,
    remote: values.remote,
    branch: values.branch,
    fromCommit: values['from-commit'],
    toCommit: values['to-commit'],
    noVerify: values['no-verify'],
    silent: values.silent,
    dryRun: values['dry-run'],
    ghToken,
    ghReleaseEdit: values['gh-release-edit'],
    ghReleaseDraft: values['gh-release-draft'],
    ghReleasePrerelease: values['gh-release-prerelease'],
    ghReleaseBody: values['gh-release-body'],
    ghGroupByLabel: values['gh-group-by-label'],
    npmAccess: values['npm-access'],
    npmDistTag: values['npm-dist-tag'],
    npmOtp: values['npm-otp'],
    npmBrowserAuth: values['npm-browser-auth'],
    tag: values.tag,
    verbose: values.verbose,
    semver: values.semver,
    major: values.major
  }
}

module.exports.argsNames = Object.entries(optionsConfig).reduce((acc, [name, config]) => {
  if (config.type === 'string') acc.string.push(name)
  if (config.type === 'boolean') acc.boolean.push(name)
  if (config.multiple === true) acc.array.push(name)
  return acc
}, { string: [], array: [], boolean: [] })
