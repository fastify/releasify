'use strict'

const t = require('tap')
const { test } = t
const parseArgs = require('../lib/args')
const proxyquire = require('proxyquire')

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
    '--gh-release-prerelease', 'true',
    '--gh-group-by-label', 'bugfix',
    '--gh-group-by-label', 'docs'
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
    ghReleaseDraft: true,
    ghReleasePrerelease: true,
    ghGroupByLabel: ['bugfix', 'docs']
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
    ghReleasePrerelease: false,
    ghGroupByLabel: []
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
    '--gh-release-prerelease=true',
    '--gh-group-by-label=bugfix',
    '--gh-group-by-label=docs'
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
    ghReleaseDraft: true,
    ghReleasePrerelease: true,
    ghGroupByLabel: ['bugfix', 'docs']
  })
})

test('parse boolean args', t => {
  t.plan(1)

  const argv = [
    '--help',
    '--major',
    '--dry-run',
    '--no-verify',
    '--gh-release-edit',
    '--gh-release-draft',
    '--gh-release-prerelease'
  ]
  const parsedArgs = parseArgs(argv)
  t.like(parsedArgs, {
    help: true,
    major: true,
    dryRun: true,
    noVerify: true,
    ghReleaseEdit: true,
    ghReleaseDraft: true,
    ghReleasePrerelease: true
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
    '-e',
    '-l', 'bugfix',
    '-l', 'docs'
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
    ghReleasePrerelease: false,
    ghGroupByLabel: ['bugfix', 'docs']
  })
})

test('get GitHub Token from env', t => {
  t.plan(1)

  process.env['MY_ENV_KEY'] = 'my_env_value'
  const argv = [ '-k', 'MY_ENV_KEY' ]
  const parsedArgs = parseArgs(argv)

  t.strictEqual(parsedArgs.ghToken, process.env['MY_ENV_KEY'])
})

test('autoload config parameters', t => {
  t.plan(5)

  const store = {
    'gh-token': '0000000000000000000000000000000000000000',
    'gh-release-edit': 'true',
    'no-verify': 'true',
    verbose: 'debug',
    remote: 'remo'
  }
  const parseArgs = proxyquire('../lib/args', {
    './local-conf': function () {
      // the values stored in the config of the user
      return { store }
    }
  })

  const argv = [ '--remote', 'arg-remote' ]
  const parsedArgs = parseArgs(argv)

  t.strictEqual(parsedArgs.ghToken, store['gh-token'])
  t.strictEqual(parsedArgs.ghReleaseEdit, true)
  t.strictEqual(parsedArgs.noVerify, true)
  t.strictEqual(parsedArgs.verbose, 'debug')
  t.strictEqual(parsedArgs.remote, 'arg-remote')
})
