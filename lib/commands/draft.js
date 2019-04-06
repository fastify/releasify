'use strict'

const GitDirectory = require('../git-directory')
const GitHUb = require('../github')

module.exports = async function (args) {
  const git = GitDirectory('../fastify_1.x/')

  const lastTag = await git.getLastTagCommit('v1*')
  console.log({ lastTag })

  const commits = await git.getLogs('HEAD', lastTag)
  console.log({ commits })

  const github = GitHUb(git.getRepoUrl())
  const labelsGenerator = github.getPRLabels(commits.map(getPRId))
  for (const x of labelsGenerator) {
    console.log((await x).data)
    // TODO analyze the labels to choose from [major, minor, patch]
    // if we reach the major we can stop asking labels
  }

  // TODO ## print out the GITHUB Release string message
}

function getPRId (logLine) {
  // TODO manage messages like "backport #123 (#124)"
  return logLine.message.match(/#(\d{1,5})/m).pop()
}
