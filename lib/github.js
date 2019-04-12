'use strict'

const parseGitUrl = require('parse-github-url')
const Octokit = require('@octokit/rest')

module.exports = function github ({ url, auth }) {
  const { owner, name } = parseGitUrl(url)

  const octokit = new Octokit({ auth })
  return {
    getPRLabels,
    createRelease
  }

  async function getPRLabels (prId) {
    const response = await octokit.issues.listLabelsOnIssue({ owner, repo: name, number: prId })
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
    // https://octokit.github.io/rest.js/#api-Repos-createRelease
    return octokit.repos.createRelease(theRelease)
  }
}
