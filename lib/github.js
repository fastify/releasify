'use strict'

const parseGitUrl = require('parse-github-url')
const Octokit = require('@octokit/rest')

module.exports = function github (githubUrl) {
  const { owner, name } = parseGitUrl(githubUrl)

  const octokit = new Octokit()
  return {
    getPRLabels
  }

  async function getPRLabels (prId) {
    const response = await octokit.issues.listLabelsOnIssue({ owner, repo: name, number: prId })
    response.pullRequest = { id: prId }
    return response
  }
}
