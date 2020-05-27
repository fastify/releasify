'use strict'

const t = require('tap')
const h = require('./helper')
const pkg = require('../package.json')

t.test(`version`, t => {
  t.plan(1)
  const cli = h.execute('', ['--version'])
  cli.stdout.setEncoding('utf8')
  cli.stdout.on('data', output => {
    t.like(output, pkg.version)
  })
})

t.test(`version strict`, t => {
  t.plan(1)
  const cli = h.execute('', ['-v'])
  cli.stdout.setEncoding('utf8')
  cli.stdout.on('data', output => {
    t.like(output, pkg.version)
  })
})

t.test(`version win over help`, t => {
  t.plan(1)
  const cli = h.execute('', ['-h', '-v'])
  cli.stdout.setEncoding('utf8')
  cli.stdout.on('data', output => {
    t.like(output, pkg.version)
  })
})
