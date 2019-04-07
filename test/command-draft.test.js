'use strict'

const t = require('tap')
// const proxyquire = require('proxyquire')

const cmd = require('../lib/commands/draft')

const { test } = t

test('draft', async t => {
  t.plan(1)

  const result = cmd({})

  t.type(result.then, 'function')
  await result
})
