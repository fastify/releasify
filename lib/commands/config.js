'use strict'

const pino = require('pino')
const { Input } = require('enquirer')
const { validate } = require('../validation')
const LocalConf = require('../local-conf')

const ARGS_SCHEMA = {
  type: 'object',
  required: ['arg'],
  properties: {
    arg: {
      type: 'string'
      // enum: [ 'debug', 'info', 'warn', 'error' ] // TODO
    }
  }
}

module.exports = async function (args) {
  validate(args, ARGS_SCHEMA)

  const logger = pino({ level: args.verbose, prettyPrint: true, base: null })
  const config = LocalConf()
  const prompt = new Input({ message: `What is the value for ${args.arg}?` })
  const value = await prompt.run()
  config.set(args.arg, value)
  logger.info('Saved %s to %s', args.arg, config.path)
  return config.path
}
