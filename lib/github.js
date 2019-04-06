'use strict'

var parseGitUrl = require('parse-github-url')
const Octokit = require('@octokit/rest')

module.exports = function github (githubUrl) {
  const { owner, name } = parseGitUrl(githubUrl)

  const octokit = new Octokit()
  return {
    getPRLabels
  }

  function getPRLabels (prId) {
    return octokit.issues.listLabelsOnIssue({ owner, repo: name, number: prId })
      .then(response => {
        response.pullRequest = { id: prId }
        return response
      })
  }
}
