'use strict'

module.exports = function factory ({ githubThrow }) {
  return function () {
    return {
      issues: {
        listLabelsOnIssue: async function (options) {
          if (githubThrow === true) {
            throw new Error('HttpError - Fake limit reached')
          }
          return {
            status: 200,
            url: `https://api.github.com/repos/${options.owner}/${options.repo}/issues/${options.number}/labels`,
            headers: {
              server: 'Test.com',
              status: '200OK'
            },
            data: [{ name: 'documentation' }],
            pullRequest: {
              id: options.number
            }
          }
        }
      },
      repos: async function createRelease (options) {
        return {}
      }
    }
  }
}
