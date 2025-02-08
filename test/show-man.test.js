'use strict'

const { test } = require('node:test')
const h = require('./helper')

// TODO move this array
const commands = ['help', 'config', 'publish', 'draft']

test('show help messages', async t => {
  t.plan(1 + commands.length)

  for (const command of commands) {
    await t.test(`command ${command}`, t => {
      t.plan(1)
      const cli = h.execute(command, ['-h'])
      cli.stdout.setEncoding('utf8')
      const { promise, resolve } = h.withResolvers()
      cli.stdout.on('data', output => {
        const contentHelp = h.readFileHelp(command)
        t.assert.deepStrictEqual(output, contentHelp)
        resolve()
      })

      return promise
    })
  }

  await t.test('command help when none params', t => {
    t.plan(1)
    const cli = h.execute('help')
    cli.stdout.setEncoding('utf8')
    const { promise, resolve } = h.withResolvers()
    cli.stdout.on('data', output => {
      const contentHelp = h.readFileHelp('help')
      t.assert.deepStrictEqual(output, contentHelp)
      resolve()
    })

    return promise
  })
})
