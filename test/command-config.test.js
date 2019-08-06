'use strict'

const t = require('tap')
const h = require('./helper')

const cmd = h.buildProxyCommand('../lib/commands/config')
const LocalConf = require('../lib/local-conf')

const { test } = t

function buildOptions () {
  const options = {
    arg: 'invalid',
    verbose: 'invalid'
  }
  return Object.assign({}, options)
}

test('mandatory options', t => {
  t.plan(2)
  t.rejects(() => cmd({}), new Error("should have required property 'arg'"))
  t.rejects(() => cmd(buildOptions()), new Error('.verbose should be equal to one of the allowed values'))
})

test('save config data', async t => {
  t.plan(3)

  const opts = buildOptions()
  opts.arg = 'semver'
  opts.verbose = 'error'

  const inputValue = 'fake input string'

  const cmd = h.buildProxyCommand('../lib/commands/config', { external:
    {
      enquirer: {
        Input: function () {
          return { async run () { return inputValue } }
        }
      }
    }
  })

  const build = await cmd(opts)
  t.equals(build.arg, opts.arg)
  t.match(build.path.toLowerCase(), /releasify-nodejs\\config\\releasify.json$/)

  t.test('correct value saved', t => {
    const localConf = LocalConf()
    t.plan(1)
    t.equals(localConf.get('semver'), inputValue)
  })
})
