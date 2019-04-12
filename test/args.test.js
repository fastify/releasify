'use strict'

const t = require('tap')
const { test } = t
const parseArgs = require('../lib/args')

test('parse all args', t => {
  t.plan(1)

  const argv = [
    '--help', 'true',
    '--path', 'a/path',
    '--tag', 'vPattern',
    '--verbose', 'info',
    '--semver', 'major',
    '--major', 'true',
    '--dry-run', 'true',
    '--remote', 'upstream',
    '--branch', 'v1',
    '--npm-access', 'public',
    '--npm-tag', 'next',
    '--gh-token', 'MY_KEY',
    '--gh-release-draft', 'true',
    '--gh-release-prerelease', 'true'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: true,
    path: 'a/path',
    tag: 'vPattern',
    verbose: 'info',
    semver: 'major',
    major: true,
    dryRun: true,
    remote: 'upstream',
    branch: 'v1',
    npmAccess: 'public',
    npmTag: 'next',
    ghToken: 'MY_KEY',
    ghReleaseDraft: 'true',
    ghReleasePrerelease: 'true'
  })
})

test('check default values', t => {
  t.plan(1)
  const parsedArgs = parseArgs([])

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: false,
    path: process.cwd(),
    tag: undefined,
    verbose: 'warn',
    semver: undefined,
    major: false,
    dryRun: false,
    remote: 'origin',
    branch: 'master',
    npmAccess: undefined,
    npmTag: undefined,
    ghToken: 'GITHUB_OAUTH_TOKEN',
    ghReleaseDraft: false,
    ghReleasePrerelease: false
  })
})

test('parse args with = assignment', t => {
  t.plan(1)

  const argv = [
    '--help=false',
    '--path="a/path with space"',
    '--tag=vPattern',
    '--verbose=info',
    '--semver=major',
    '--major=true',
    '--dry-run=true',
    '--remote=upstream',
    '--branch=v1',
    '--npm-access=public',
    '--npm-tag=next',
    '--gh-token=MY_KEY',
    '--gh-release-draft=true',
    '--gh-release-prerelease=true'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: false,
    path: 'a/path with space',
    tag: 'vPattern',
    verbose: 'info',
    semver: 'major',
    major: true,
    dryRun: true,
    remote: 'upstream',
    branch: 'v1',
    npmAccess: 'public',
    npmTag: 'next',
    ghToken: 'MY_KEY',
    ghReleaseDraft: 'true',
    ghReleasePrerelease: 'true'
  })
})

test('parse args aliases', t => {
  t.plan(1)

  const argv = [
    '-h',
    '-p', 'a/path',
    '-t', 'vPattern',
    '-v', 'info',
    '-s', 'major',
    '-m',
    '-r', 'upstream',
    '-b', 'v1.x',
    '-a', 'public',
    '-k', 'MY_KEY'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: true,
    path: 'a/path',
    tag: 'vPattern',
    verbose: 'info',
    semver: 'major',
    major: true,
    dryRun: false,
    remote: 'upstream',
    branch: 'v1.x',
    npmAccess: 'public',
    npmTag: undefined,
    ghToken: 'MY_KEY',
    ghReleaseDraft: false,
    ghReleasePrerelease: false
  })
})

test('get GitHub Token from env', t => {
  t.plan(1)

  process.env['MY_ENV_KEY'] = 'my_env_value'
  const argv = [ '-k', 'MY_ENV_KEY' ]
  const parsedArgs = parseArgs(argv)

  t.strictEqual(parsedArgs.ghToken, process.env['MY_ENV_KEY'])
})
