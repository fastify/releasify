'use strict'

const { test } = require('node:test')
const h = require('./helper')
const pkg = require('../package.json')

test('defaults to help', t => {
  t.plan(1)
  const cli = h.execute('', [])
  cli.stdout.setEncoding('utf8')
  const { promise, resolve } = h.withResolvers()
  cli.stdout.on('data', output => {
    t.assert.deepStrictEqual(output, h.readFileHelp('help'))
    resolve()
  })

  return promise
})

test('version', t => {
  t.plan(1)
  const cli = h.execute('', ['--version'])
  cli.stdout.setEncoding('utf8')
  const { promise, resolve } = h.withResolvers()
  cli.stdout.on('data', output => {
    t.assert.ok(output.includes(pkg.version))
    resolve()
  })

  return promise
})

test('version strict', t => {
  t.plan(1)
  const cli = h.execute('', ['-v'])
  cli.stdout.setEncoding('utf8')
  const { promise, resolve } = h.withResolvers()
  cli.stdout.on('data', output => {
    t.assert.ok(output.includes(pkg.version))
    resolve()
  })

  return promise
})

test('version win over help', t => {
  t.plan(1)
  const cli = h.execute('', ['-h', '-v'])
  cli.stdout.setEncoding('utf8')
  const { promise, resolve } = h.withResolvers()
  cli.stdout.on('data', output => {
    t.assert.ok(output.includes(pkg.version))
    resolve()
  })

  return promise
})

test('config error', t => {
  t.plan(1)
  const cli = h.execute('config', ['--arg', 'wrong'])
  cli.stdout.setEncoding('utf8')
  const { promise, resolve } = h.withResolvers()
  cli.stdout.on('data', output => {
    t.assert.match(output, /arg must be equal to one of the allowed values/)
    resolve()
  })

  return promise
})
