'use strict'

const { test } = require('tap')
const h = require('./helper')

// TODO move this array
const commands = ['help', 'login', 'whoami', 'publish', 'draft']

test('show help messages', async t => {
  t.plan(1 + commands.length)

  commands.forEach(command => {
    t.test(`command ${command}`, sub => {
      sub.plan(1)
      const cli = h.execute(command, ['-h'])
      cli.stdout.setEncoding('utf8')
      cli.stdout.on('data', output => {
        const contentHelp = h.readFileHelp(command)
        sub.equals(output, contentHelp)
      })
    })
  })

  t.test('command help when none params', sub => {
    sub.plan(1)
    const cli = h.execute('help')
    cli.stdout.setEncoding('utf8')
    cli.stdout.on('data', output => {
      const contentHelp = h.readFileHelp('help')
      sub.equals(output, contentHelp)
    })
  })
})
