'use strict'

/**
 * The npm commands are executed via child_process.spawn. This mock implement only the fields that
 * are used by the npm.js adding a simulator environment.
 *
 * A possible input is:
 * {
 *   ping: { code: 0 },
 *   whoami: { code: 0, data: 'string' },
 *   config: { code: 0, data: 'string' },
 *   version: { code: 0, data: 'string' },
 *   publish: { code: 0, data: 'string' }
 * }
 */
module.exports = function factory (opts) {
  const commandsCode = Object.assign({}, opts)
  return {
    spawn: function (node, args, opts) {
      const command = args[0]
      let dataCallback
      return {
        stdout: {
          setEncoding: function (encoding) {},
          on: function (event, cb) {
            if (event === 'data') {
              dataCallback = cb
            }
          }
        },
        on: function (event, cb) {
          setTimeout(() => {
            // Default success
            const { code, data } = commandsCode[command] || { code: 0 }
            if (data && dataCallback) {
              dataCallback(data)
            }
            cb(code) // eslint-disable-line standard/no-callback-literal
          }, 0)
        }
      }
    }
  }
}
