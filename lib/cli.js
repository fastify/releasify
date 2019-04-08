#!/usr/bin/env node
'use strict'

const logger = require('pino')({ level: 'info', prettyPrint: true, base: null, timestamp: false })
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
          logger.info(out)
        }
      } catch (error) {
        logger.error(error)
      }
    }
  })
})

const res = commist.parse(process.argv.splice(2))
if (res) {
  require('./commands/help')(['-h'])
}
