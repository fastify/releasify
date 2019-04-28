'use strict'

function shouldThrows (cmd = {}, params) {
  if (cmd.inputChecker) {
    cmd.inputChecker(params)
  }

  return cmd.throwError || false
}

/**
 *
 * A possible input is:
 * {
 *   tag: {inputChecker: func, throwError: true, history: number of tag commit list}
 *   log: {inputChecker: func, throwError: true, messages: [array of messages to use]}
 *   status: {throwError: true, dirty: true, tracking: 'origin/master'}
 *   add: {inputChecker: func, throwError: true}
 *   commit: {inputChecker: func, throwError: true, branch: 'master'}
 *   push: {inputChecker: func, throwError: true}
 *   pull: {inputChecker: func, throwError: true}
 * }
 */
module.exports = function factory (opts = {}) {
  return function (path) {
    const state = {
      history: []
    }
    return {
      tag: function (params, cb) {
        if (shouldThrows(opts['tag'], params)) {
          cb(new Error('Error throws by settings'))
          return
        }

        const history = []
        for (let i = 0; i < (opts['tag'].history || 0); i++) {
          history.push('123abc'.repeat(6) + i)
        }

        state.history = history
        cb(null, history.join('\n'))
      },
      log: function (params, cb) {
        if (shouldThrows(opts['log'], params)) {
          cb(new Error('Error throws by settings'))
          return
        }

        const messagesSet = opts['log'] ? (opts['log'].messages || []) : []
        const all = state.history.map(hash => ({
          hash,
          date: '2019-04-06 15:45:43 +0200',
          message: messagesSet.pop() || 'this is a standard comment (#123)',
          refs: '',
          body: '',
          author_name: 'Manuel Spigolon',
          author_email: 'behemoth89@gmail.com'
        }))

        cb(null, { all })
      },
      status: function (cb) {
        if (shouldThrows(opts['status'], null)) {
          cb(new Error('Error throws by settings'))
          return
        }

        const modified = []
        if (opts['status'] && opts['status'].dirty === true) {
          modified.push('dirty-status.js')
        }

        const tracking = (opts['status'] && opts['status'].tracking) ? opts['status'].tracking : 'origin/master'

        cb(null, {
          not_added: [],
          conflicted: [],
          created: [],
          deleted: [],
          modified,
          renamed: [],
          files: [],
          staged: [],
          ahead: 0,
          behind: 0,
          tracking
        })
      },
      add: function (params, cb) {
        if (shouldThrows(opts['add'], params)) {
          cb(new Error('Error throws by settings'))
          return
        }

        cb(null)
      },
      commit: function (params, options, cb) {
        if (shouldThrows(opts['commit'], params)) {
          cb(new Error('Error throws by settings'))
          return
        }

        const commitMessage = {
          commit: 'HASH123',
          branch: (opts['commit'] ? opts['commit'].branch : '') || 'master'
        }
        cb(null, commitMessage)
      },
      push: function (params, cb) {
        if (shouldThrows(opts['push'], params)) {
          cb(new Error('Error throws by settings'))
          return
        }

        cb(null)
      },
      pull: function (params, cb) {
        if (shouldThrows(opts['pull'], params)) {
          cb(new Error('Error throws by settings'))
          return
        }

        cb(null)
      }
    }
  }
}
