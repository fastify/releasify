#!/usr/bin/env node
'use strict'

const commist = require('commist')()
const { needToShowHelp } = require('./man')
const parseArgs = require('./args');

['help', 'login', 'whoami', 'publish', 'draft'].forEach(command => {
  const fn = require(`./commands/${command}`)
  commist.register(command, (args) => {
    const opts = parseArgs(args)
    if (!needToShowHelp(command, opts)) {
      fn(opts)
    }
  })
})

const res = commist.parse(process.argv.splice(2))
if (res) {
  require('./commands/help')(['-h'])
}
