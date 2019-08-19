'use strict'

const t = require('tap')
const { test } = t
const parseArgs = require('../lib/args')

test('parse all args', t => {
  t.plan(1)

  const argv = [
    '--arg', 'arg',
    '--help', 'true',
    '--path', 'a/path',
    '--tag', 'vPattern',
    '--verbose', 'info',
    '--semver', 'major',
    '--major', 'true',
    '--dry-run', 'true',
    '--remote', 'upstream',
    '--branch', 'v1',
    '--from-commit', 'commitFrom',
    '--to-commit', 'commitTo',
    '--no-verify', 'true',
    '--npm-otp', '123123',
    '--npm-access', 'public',
    '--npm-dist-tag', 'next',
    '--gh-token', 'MY_KEY',
    '--gh-release-edit', 'true',
    '--gh-release-draft', 'true',
    '--gh-release-prerelease', 'true'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: true,
    arg: 'arg',
    path: 'a/path',
    tag: 'vPattern',
    verbose: 'info',
    semver: 'major',
    major: true,
    dryRun: true,
    remote: 'upstream',
    branch: 'v1',
    fromCommit: 'commitFrom',
    toCommit: 'commitTo',
    noVerify: true,
    npmOtp: '123123',
    npmAccess: 'public',
    npmDistTag: 'next',
    ghToken: 'MY_KEY',
    ghReleaseEdit: true,
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
    arg: undefined,
    path: process.cwd(),
    tag: undefined,
    verbose: 'warn',
    semver: undefined,
    major: false,
    dryRun: false,
    remote: 'origin',
    branch: 'master',
    fromCommit: 'HEAD',
    toCommit: undefined,
    noVerify: undefined,
    npmOtp: undefined,
    npmAccess: undefined,
    npmDistTag: undefined,
    ghToken: 'GITHUB_OAUTH_TOKEN',
    ghReleaseEdit: false,
    ghReleaseDraft: false,
    ghReleasePrerelease: false
  })
})

test('parse args with = assignment', t => {
  t.plan(1)

  const argv = [
    '--help=false',
    '--arg=arg',
    '--path="a/path with space"',
    '--tag=vPattern',
    '--verbose=info',
    '--semver=major',
    '--major=true',
    '--dry-run=true',
    '--remote=upstream',
    '--branch=v1',
    '--from-commit=commitFrom',
    '--to-commit=commitTo',
    '--no-verify=false',
    '--npm-otp=123123',
    '--npm-access=public',
    '--npm-dist-tag=next',
    '--gh-token=MY_KEY',
    '--gh-release-edit=true',
    '--gh-release-draft=true',
    '--gh-release-prerelease=true'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: false,
    arg: 'arg',
    path: 'a/path with space',
    tag: 'vPattern',
    verbose: 'info',
    semver: 'major',
    major: true,
    dryRun: true,
    remote: 'upstream',
    branch: 'v1',
    fromCommit: 'commitFrom',
    toCommit: 'commitTo',
    noVerify: false,
    npmOtp: '123123',
    npmAccess: 'public',
    npmDistTag: 'next',
    ghToken: 'MY_KEY',
    ghReleaseEdit: true,
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
    '-n',
    '-a', 'public',
    '-k', 'MY_KEY',
    '-e'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: true,
    arg: undefined,
    path: 'a/path',
    tag: 'vPattern',
    verbose: 'info',
    semver: 'major',
    major: true,
    dryRun: false,
    remote: 'upstream',
    branch: 'v1.x',
    fromCommit: 'HEAD',
    toCommit: undefined,
    noVerify: true,
    npmOtp: undefined,
    npmAccess: 'public',
    npmDistTag: undefined,
    ghToken: 'MY_KEY',
    ghReleaseEdit: true,
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
