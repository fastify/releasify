#!/usr/bin/env node
'use strict'

const commist = require('commist')()
const { needToShowHelp } = require('./man')
const parseArgs = require('./args');

['help', 'login', 'whoami', 'publish', 'draft'].forEach(command => {
  const fn = require(`./commands/${command}`)
  commist.register(command, async (args) => {
    const opts = parseArgs(args)
    if (!needToShowHelp(command, opts)) {
      try {
        const out = await fn(opts)
        if (out) {
          console.log(out)
        }
      } catch (error) {
        // TODO logger fatal error
        console.log(error)
      }
    }
  })
})

const res = commist.parse(process.argv.splice(2))
if (res) {
  require('./commands/help')(['-h'])
}
