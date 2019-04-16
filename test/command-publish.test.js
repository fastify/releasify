'use strict'

const t = require('tap')
const { join } = require('path')
const h = require('./helper')

const cmd = h.buildProxyCommand('../lib/commands/publish', {
  git: { tag: { history: 5 } },
  github: { }, // default OK
  npm: { } // default OK
})

const { test } = t

function buildOptions () {
  const options = {
    path: join(__dirname, 'fake-project/'),
    tag: null,
    verbose: 'error',
    semver: null,
    major: false,
    remote: 'origin',
    branch: 'master',
    ghToken: 'INVALID_TOKEN'
  }
  return Object.assign({}, options)
}

test('mandatory options', t => {
  t.plan(2)
  t.rejects(() => cmd({}), new Error(" should have required property 'major',  should have required property 'path',  should have required property 'remote',  should have required property 'branch',  should have required property 'ghToken',  should have required property 'verbose',  should have required property 'semver'"))
  t.rejects(() => cmd(buildOptions()), new Error('.tag should be string, .ghToken should NOT be shorter than 40 characters, .semver should be string, .semver should be equal to one of the allowed values'))
})

test('try to publish a repo not sync', t => {
  t.plan(1)
  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    git: { status: { dirty: true } }
  })
  const opts = buildOptions()
  opts.semver = 'patch'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag
  t.rejects(() => cmd(opts), new Error('The git repo must be clean (committed and pushed) before releasing!'))
})

test('try to publish 0 new commits', t => {
  t.plan(1)
  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 0 } } }) }
  })
  const opts = buildOptions()
  opts.semver = 'patch'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag
  t.rejects(() => cmd(opts), new Error('There are ZERO commit to relase!'))
})

test('try to publish with a wrong token')

test('publish a module never released')

test('try to publish a module version already released')

test('publish a module minor')

test('fails to build the release')

test('try to publish a module major', t => {
  t.plan(1)
  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 1 } } }) }
  })
  const opts = buildOptions()
  opts.semver = 'major'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag
  t.rejects(() => cmd(opts), new Error('You can not release a major version without --major flag'))
})

test('publish a module major')
