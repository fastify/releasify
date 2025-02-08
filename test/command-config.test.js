'use strict'

const { test } = require('node:test')
const h = require('./helper')
const fs = require('node:fs')

const cmd = h.buildProxyCommand('../lib/commands/config')
const LocalConf = require('../lib/local-conf')

function buildOptions () {
  const options = {
    arg: 'invalid',
    verbose: 'invalid'
  }
  return Object.assign({}, options)
}

test('mandatory options', t => {
  t.plan(2)
  t.assert.rejects(() => cmd({}), new Error(" must have required property 'arg'"))
  t.assert.rejects(() => cmd(buildOptions()), new Error('.arg must be equal to one of the allowed values, .verbose must be equal to one of the allowed values'))
})

test('save config data', async t => {
  t.plan(3)

  const opts = buildOptions()
  opts.arg = 'semver'
  opts.verbose = 'error'

  const inputValue = 'fake input string'

  const cmd = h.buildProxyCommand('../lib/commands/config', {
    external:
    {
      enquirer: {
        Input: function () {
          return { async run () { return inputValue } }
        }
      }
    }
  })

  const build = await cmd(opts)
  t.assert.deepStrictEqual(build.arg, opts.arg)
  t.assert.match(build.path.toLowerCase(), /releasify-nodejs[/\\].*releasify.json$/)

  t.test('correct value saved', t => {
    const localConf = LocalConf()
    t.plan(1)
    t.assert.deepStrictEqual(localConf.get('semver'), inputValue)
  })

  t.after(() => {
    fs.unlinkSync(build.path)
  })
})
