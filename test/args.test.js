'use strict'

const { test } = require('node:test')

const parseArgs = require('../lib/args')
const proxyquire = require('proxyquire')

test('parse all args', t => {
  t.plan(24)

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
    '--silent', 'true',
    '--npm-access', 'public',
    '--npm-dist-tag', 'next',
    '--gh-token', 'MY_KEY',
    '--gh-release-edit', 'true',
    '--gh-release-draft', 'true',
    '--gh-release-prerelease', 'true',
    '--gh-release-body', 'true',
    '--gh-group-by-label', 'bugfix',
    '--gh-group-by-label', 'docs'
  ]
  const parsedArgs = parseArgs(argv)

  t.assert.deepStrictEqual(parsedArgs._, [])
  t.assert.deepStrictEqual(parsedArgs.help, true)
  t.assert.deepStrictEqual(parsedArgs.arg, 'arg')
  t.assert.deepStrictEqual(parsedArgs.path, 'a/path')
  t.assert.deepStrictEqual(parsedArgs.tag, 'vPattern')
  t.assert.deepStrictEqual(parsedArgs.verbose, 'info')
  t.assert.deepStrictEqual(parsedArgs.semver, 'major')
  t.assert.deepStrictEqual(parsedArgs.major, true)
  t.assert.deepStrictEqual(parsedArgs.dryRun, true)
  t.assert.deepStrictEqual(parsedArgs.remote, 'upstream')
  t.assert.deepStrictEqual(parsedArgs.branch, 'v1')
  t.assert.deepStrictEqual(parsedArgs.fromCommit, 'commitFrom')
  t.assert.deepStrictEqual(parsedArgs.toCommit, 'commitTo')
  t.assert.deepStrictEqual(parsedArgs.noVerify, true)
  t.assert.deepStrictEqual(parsedArgs.npmOtp, '123123')
  t.assert.deepStrictEqual(parsedArgs.silent, true)
  t.assert.deepStrictEqual(parsedArgs.npmAccess, 'public')
  t.assert.deepStrictEqual(parsedArgs.npmDistTag, 'next')
  t.assert.deepStrictEqual(parsedArgs.ghToken, 'MY_KEY')
  t.assert.deepStrictEqual(parsedArgs.ghReleaseEdit, true)
  t.assert.deepStrictEqual(parsedArgs.ghReleaseDraft, true)
  t.assert.deepStrictEqual(parsedArgs.ghReleasePrerelease, true)
  t.assert.deepStrictEqual(parsedArgs.ghReleaseBody, true)
  t.assert.deepStrictEqual(parsedArgs.ghGroupByLabel, ['bugfix', 'docs'])
})

test('check default values', t => {
  t.plan(24)
  const parsedArgs = parseArgs([])

  t.assert.deepStrictEqual(parsedArgs._, [])
  t.assert.deepStrictEqual(parsedArgs.help, false)
  t.assert.deepStrictEqual(parsedArgs.arg, undefined)
  t.assert.deepStrictEqual(parsedArgs.path, process.cwd())
  t.assert.deepStrictEqual(parsedArgs.tag, undefined)
  t.assert.deepStrictEqual(parsedArgs.verbose, 'warn')
  t.assert.deepStrictEqual(parsedArgs.semver, undefined)
  t.assert.deepStrictEqual(parsedArgs.major, false)
  t.assert.deepStrictEqual(parsedArgs.dryRun, false)
  t.assert.deepStrictEqual(parsedArgs.remote, 'origin')
  t.assert.deepStrictEqual(parsedArgs.branch, 'main')
  t.assert.deepStrictEqual(parsedArgs.fromCommit, 'HEAD')
  t.assert.deepStrictEqual(parsedArgs.toCommit, undefined)
  t.assert.deepStrictEqual(parsedArgs.noVerify, undefined)
  t.assert.deepStrictEqual(parsedArgs.npmOtp, undefined)
  t.assert.deepStrictEqual(parsedArgs.silent, false)
  t.assert.deepStrictEqual(parsedArgs.npmAccess, undefined)
  t.assert.deepStrictEqual(parsedArgs.npmDistTag, undefined)
  t.assert.deepStrictEqual(parsedArgs.ghToken, 'GITHUB_OAUTH_TOKEN')
  t.assert.deepStrictEqual(parsedArgs.ghReleaseEdit, false)
  t.assert.deepStrictEqual(parsedArgs.ghReleaseDraft, false)
  t.assert.deepStrictEqual(parsedArgs.ghReleasePrerelease, false)
  t.assert.deepStrictEqual(parsedArgs.ghReleaseBody, false)
  t.assert.deepStrictEqual(parsedArgs.ghGroupByLabel, [])
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
    '--silent=false',
    '--npm-access=public',
    '--npm-dist-tag=next',
    '--gh-token=MY_KEY',
    '--gh-release-edit=true',
    '--gh-release-draft=true',
    '--gh-release-prerelease=true',
    '--gh-release-body=true',
    '--gh-group-by-label=bugfix',
    '--gh-group-by-label=docs'
  ]
  const parsedArgs = parseArgs(argv)

  t.assert.deepStrictEqual(parsedArgs, {
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
    silent: false,
    npmAccess: 'public',
    npmDistTag: 'next',
    ghToken: 'MY_KEY',
    ghReleaseEdit: true,
    ghReleaseDraft: true,
    ghReleasePrerelease: true,
    ghReleaseBody: true,
    ghGroupByLabel: ['bugfix', 'docs']
  })
})

test('parse boolean args', t => {
  t.plan(8)

  const argv = [
    '--help',
    '--major',
    '--dry-run',
    '--no-verify',
    '--gh-release-edit',
    '--gh-release-draft',
    '--gh-release-prerelease',
    '--gh-release-body'
  ]
  const parsedArgs = parseArgs(argv)

  t.assert.deepStrictEqual(parsedArgs.help, true)
  t.assert.deepStrictEqual(parsedArgs.major, true)
  t.assert.deepStrictEqual(parsedArgs.dryRun, true)
  t.assert.deepStrictEqual(parsedArgs.noVerify, true)
  t.assert.deepStrictEqual(parsedArgs.ghReleaseEdit, true)
  t.assert.deepStrictEqual(parsedArgs.ghReleaseDraft, true)
  t.assert.deepStrictEqual(parsedArgs.ghReleasePrerelease, true)
  t.assert.deepStrictEqual(parsedArgs.ghReleaseBody, true)
})

test('parse args aliases', t => {
  t.plan(24)

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
    '-x',
    '-l', 'bugfix',
    '-l', 'docs'
  ]
  const parsedArgs = parseArgs(argv)

  t.assert.deepStrictEqual(parsedArgs._, [])
  t.assert.deepStrictEqual(parsedArgs.help, true)
  t.assert.deepStrictEqual(parsedArgs.arg, undefined)
  t.assert.deepStrictEqual(parsedArgs.path, 'a/path')
  t.assert.deepStrictEqual(parsedArgs.tag, 'vPattern')
  t.assert.deepStrictEqual(parsedArgs.verbose, 'info')
  t.assert.deepStrictEqual(parsedArgs.semver, 'major')
  t.assert.deepStrictEqual(parsedArgs.major, true)
  t.assert.deepStrictEqual(parsedArgs.dryRun, false)
  t.assert.deepStrictEqual(parsedArgs.remote, 'upstream')
  t.assert.deepStrictEqual(parsedArgs.branch, 'v1.x')
  t.assert.deepStrictEqual(parsedArgs.fromCommit, 'HEAD')
  t.assert.deepStrictEqual(parsedArgs.toCommit, undefined)
  t.assert.deepStrictEqual(parsedArgs.noVerify, true)
  t.assert.deepStrictEqual(parsedArgs.npmOtp, undefined)
  t.assert.deepStrictEqual(parsedArgs.silent, false)
  t.assert.deepStrictEqual(parsedArgs.npmAccess, 'public')
  t.assert.deepStrictEqual(parsedArgs.npmDistTag, undefined)
  t.assert.deepStrictEqual(parsedArgs.ghToken, 'MY_KEY')
  t.assert.deepStrictEqual(parsedArgs.ghReleaseEdit, true)
  t.assert.deepStrictEqual(parsedArgs.ghReleaseDraft, false)
  t.assert.deepStrictEqual(parsedArgs.ghReleasePrerelease, false)
  t.assert.deepStrictEqual(parsedArgs.ghReleaseBody, true)
  t.assert.deepStrictEqual(parsedArgs.ghGroupByLabel, ['bugfix', 'docs'])
})

test('get GitHub Token from env', t => {
  t.plan(1)

  process.env.MY_ENV_KEY = 'my_env_value'
  const argv = ['-k', 'MY_ENV_KEY']
  const parsedArgs = parseArgs(argv)

  t.assert.deepStrictEqual(parsedArgs.ghToken, process.env.MY_ENV_KEY)
})

test('autoload config parameters', t => {
  t.plan(5)

  const store = {
    'gh-token': '0000000000000000000000000000000000000000',
    'gh-release-edit': true,
    'no-verify': true,
    verbose: 'debug',
    remote: 'remo'
  }
  const parseArgs = proxyquire('../lib/args', {
    './local-conf': function () {
      // the values stored in the config of the user
      return { store }
    }
  })

  const argv = ['--remote', 'arg-remote']
  const parsedArgs = parseArgs(argv)

  t.assert.deepStrictEqual(parsedArgs.ghToken, store['gh-token'])
  t.assert.deepStrictEqual(parsedArgs.ghReleaseEdit, true)
  t.assert.deepStrictEqual(parsedArgs.noVerify, true)
  t.assert.deepStrictEqual(parsedArgs.verbose, 'debug')
  t.assert.deepStrictEqual(parsedArgs.remote, 'arg-remote')
})
