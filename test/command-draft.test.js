'use strict'

const { join } = require('path')
const t = require('tap')
const h = require('./helper')

const cmd = h.buildProxyCommand('../lib/commands/draft')

const { test } = t
const options = {
  path: 'a/path',
  tag: null,
  verbose: 'error',
  semver: null
}

test('mandatory options', t => {
  t.plan(2)
  t.rejects(() => cmd({}), new Error("should have required property 'path',  should have required property 'verbose'"))
  t.rejects(() => cmd(options), new Error('.tag should be string, .semver should be string, .semver should be equal to one of the allowed values'))
})

test('draft a version forced release', async t => {
  t.plan(3)

  const opts = Object.assign({}, options)
  opts.path = join(__dirname, 'fake-project/')
  opts.semver = 'major'
  delete opts.tag // autosense

  const build = await cmd(opts)
  t.equals(build.version, '12.0.0')
  t.equals(build.oldVersion, '11.14.42')
  t.equals(build.message, '📚 PR:\n- This is a commit without PR\n- doc add fastify-schema-constraint to ecosystem (#1573)\n- Update Ecosystem.md (#1570)\n- Update Routes.md (#1579)\n- TOC added to Reply.md (#1582)\n')
})

test('draft a suggested release', async t => {
  t.plan(2)

  const opts = Object.assign({}, options)
  opts.path = join(__dirname, 'fake-project/')
  delete opts.tag // autosense
  delete opts.semver // auto-calculate

  const build = await cmd(opts)
  // TODO: now the suggestedRelease is not implemented
  t.equals(build.version, '11.14.42')
  t.equals(build.oldVersion, '11.14.42')
})

test('draft the first release', async t => {
  t.plan(2)

  const cmd = h.buildProxyCommand('../lib/commands/draft', { emptyTag: true })
  const opts = Object.assign({}, options)
  opts.path = join(__dirname, 'fake-project/')
  opts.tag = 'bad-pattern'
  delete opts.semver // auto-calculate

  const build = await cmd(opts)
  t.equals(build.version, '11.14.42')
  t.equals(build.oldVersion, '11.14.42')
})

test('error management getting PR', async t => {
  t.plan(2)

  const cmd = h.buildProxyCommand('../lib/commands/draft', { githubThrow: true })
  const opts = Object.assign({}, options)
  opts.path = join(__dirname, 'fake-project/')
  opts.tag = 'bad-pattern'
  delete opts.semver // auto-calculate

  const build = await cmd(opts)
  t.equals(build.version, '11.14.42')
  t.equals(build.oldVersion, '11.14.42')
})
