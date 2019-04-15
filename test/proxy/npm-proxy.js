'use strict'

module.exports = function factory (opts) {
  return {
    spawn: function (node, args, opts) {
      return {
        stdout: {
          setEncoding: function (encoding) {},
          on: function (event, cb) {}
        },
        on: function (event, cb) {
          setTimeout(() => {
            cb(0, 'SIG') // eslint-disable-line standard/no-callback-literal
          }, 0)
        }
      }
    }
  }
}
