'use strict'

// const { join } = require('path')
const t = require('tap')
const h = require('./helper')

const cmd = h.buildProxyCommand('../lib/commands/publish')

const { test } = t

function buildOptions () {
  const options = {
    path: 'a/path',
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

test('try to publish a repo not sync')

test('try to publish 0 new commits')

test('try to publish with a wrong token')

test('publish a module never released')

test('try to publish a module version already released')

test('publish a module minor')

test('fails to build the release')

test('try to publish a module major')

test('publish a module major')
