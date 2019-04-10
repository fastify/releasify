'use strict'

const parseGitUrl = require('parse-github-url')
const Octokit = require('@octokit/rest')

module.exports = function github (githubUrl) {
  const { owner, name } = parseGitUrl(githubUrl)

  const octokit = new Octokit()
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
  async function createRelease () {
    const theRelease = {
      owner,
      repo: name,
      tag_name,
      target_commitish,
      name,
      body,
      draft,
      prerelease
    }
    // https://octokit.github.io/rest.js/#api-Repos-createRelease
    const response = await octokit.repos.createRelease(theRelease)
    return response // .html_url
  }
}
