#!/usr/bin/env node
'use strict'

const logger = require('pino')({ level: 'info', base: null, timestamp: false, transport: { target: 'pino-pretty' } })
const commands = ['help', 'config', 'publish', 'draft']
const commist = require('commist')()
const { needToShowHelp } = require('./man')
const parseArgs = require('./args')

for (const command of commands) {
  const fn = require(`./commands/${command}`)
  commist.register(command, async (args) => {
    const opts = parseArgs(args)
    if (needToShowHelp(command, opts)) {
      return
    }
    try {
      logger.debug('Starting %s command', command)
      await fn(opts)
    } catch (error) {
      logger.error(error)
    }
  })
}

const res = commist.parse(process.argv.splice(2))
if (res) {
  if (res.includes('-v') || res.includes('--version')) {
    const pkg = require('../package.json')
    console.log(`v${pkg.version}`)
  } else {
    require('./commands/help')(['-h'])
  }
}
