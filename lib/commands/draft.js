'use strict'

const Octokit = require('@octokit/rest')
const octokit = new Octokit()

const GitDirectory = require('../git-directory')

module.exports = async function (args) {
  // TODO

  // ## analyze the labels to choose from [major, minor, patch]
  // print out the result
  // [NOTE for PUBLISH command] if major => block it (unless there is a boolean option)

  // ## print out the GITHUB Release string message
  // print out the result
  // [NOTE for PUBLISH command] https://developer.github.com/v3/repos/releases/

  const git = GitDirectory('../fastify_1.x/')

  const lastTag = await git.getLastTagCommit('v1*')
  console.log({ lastTag })

  const commits = await git.getLogs('HEAD', lastTag)
  console.log({ commits })

  commits.map(getPRId).forEach(async (prId) => {
    console.log({ element: prId })

    const owner = 'fastify' // TODO in config
    const repo = 'fastify' // TODO read from the package.json of the project
    const number = prId
    // const per_page =
    // const page =
    try {
      const result = await octokit.issues.listLabelsOnIssue({ owner, repo, number })
      const labels = result.data.map(label => label.name)
      console.log({ [prId]: labels })
    } catch (error) {
      console.log({ error })
    }
  })
}

function getPRId (logLine) {
  // TODO manage messages like "backport #123 (#124)"
  return logLine.message.match(/#(\d{1,5})/m).pop()
}
