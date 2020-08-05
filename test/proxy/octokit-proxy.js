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
 *   labels: {inputChecker: func, throwError: true}
 *   release: {inputChecker: func, throwError: true}
 * }
 */
module.exports = function factory (opts = {}) {
  return { Octokit: builder }

  function builder () {
    return {
      issues: {
        listLabelsOnIssue: async function (options) {
          if (shouldThrows(opts.labels, options)) {
            throw new Error('HttpError - Fake limit reached')
          }

          // customize the output labels
          let data
          if (opts.labels) {
            data = opts.labels.data
          } else {
            data = [{ name: 'documentation' }]
          }

          return {
            status: 200,
            url: `https://api.github.com/repos/${options.owner}/${options.repo}/issues/${options.number}/labels`,
            headers: {
              server: 'Test.com',
              status: '200OK'
            },
            data,
            pullRequest: {
              id: options.number
            }
          }
        }
      },
      repos: {
        createRelease: async function (options) {
          if (shouldThrows(opts.release, options)) {
            throw new Error('HttpError - Release error')
          }
          return { data: { html_url: 'my-awesome-release-url' } }
        }
      }
    }
  }
}
