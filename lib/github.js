'use strict'

const parseGitUrl = require('parse-github-url')
const { Octokit } = require('@octokit/rest')

module.exports = function github ({ url, auth }, logger) {
  const { owner, name } = parseGitUrl(url)

  const octokit = new Octokit({
    auth,

    log: {
      debug: logger.trace.bind(logger),
      info: logger.info.bind(logger),
      warn: logger.warn.bind(logger),
      error: logger.error.bind(logger)
    }
  })
  return {
    getPRLabels,
    createRelease
  }

  async function getPRLabels (prId) {
    const response = await octokit.issues.listLabelsOnIssue({ owner, repo: name, issue_number: prId })
    response.pullRequest = { id: prId }
    return response
  }

  // https://developer.github.com/v3/repos/releases/#create-a-release
  function createRelease (opts) {
    const theRelease = {
      owner,
      repo: name,
      ...opts
    }
    // https://octokit.github.io/rest.js/v18#api-Repos-createRelease
    return octokit.repos.createRelease(theRelease)
  }
}
