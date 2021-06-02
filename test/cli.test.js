'use strict'

const t = require('tap')
const h = require('./helper')
const pkg = require('../package.json')

t.test('defaults to help', t => {
  t.plan(1)
  const cli = h.execute('', [])
  cli.stdout.setEncoding('utf8')
  cli.stdout.on('data', output => {
    t.match(output, h.readFileHelp('help'))
  })
})

t.test('version', t => {
  t.plan(1)
  const cli = h.execute('', ['--version'])
  cli.stdout.setEncoding('utf8')
  cli.stdout.on('data', output => {
    t.match(output, pkg.version)
  })
})

t.test('version strict', t => {
  t.plan(1)
  const cli = h.execute('', ['-v'])
  cli.stdout.setEncoding('utf8')
  cli.stdout.on('data', output => {
    t.match(output, pkg.version)
  })
})

t.test('version win over help', t => {
  t.plan(1)
  const cli = h.execute('', ['-h', '-v'])
  cli.stdout.setEncoding('utf8')
  cli.stdout.on('data', output => {
    t.match(output, pkg.version)
  })
})

t.test('config error', t => {
  t.plan(1)
  const cli = h.execute('config', ['--arg', 'wrong'])
  cli.stdout.setEncoding('utf8')
  cli.stdout.on('data', output => {
    t.match(output, /arg should be equal to one of the allowed values/)
  })
})
