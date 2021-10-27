'use strict'

const pino = require('pino')
const { Input } = require('enquirer')
const { validate } = require('../validation')
const { argsNames } = require('../args')
const LocalConf = require('../local-conf')

const ARGS_SCHEMA = {
  type: 'object',
  required: ['arg'],
  properties: {
    arg: {
      type: 'string',
      enum: argsNames.string.concat(argsNames.boolean)
    },
    verbose: {
      type: 'string',
      enum: ['trace', 'debug', 'info', 'warn', 'error']
    }
  }
}

module.exports = async function (args) {
  validate(args, ARGS_SCHEMA)

  const logger = pino({ level: args.verbose, prettyPrint: true, base: null })
  const config = LocalConf()
  const { arg } = args
  const prompt = new Input({ message: `What is the value for ${arg}?` })
  const value = await prompt.run()
  config.set(arg, value)
  logger.info('Saved %s to %s', arg, config.path)

  return {
    arg,
    path: config.path
  }
}
