const pino = require('pino')

module.exports = function createLogger (args) {
  return pino({ level: args.verbose, prettyPrint: true, base: null })
}
