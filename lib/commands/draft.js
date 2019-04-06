'use strict'

const GitDirectory = require('../git-directory')
const GitHub = require('../github')
const releaseBuilder = require('../release-message')()

module.exports = async function (args) {
  const git = GitDirectory(args.path)

  const lastTag = await git.getLastTagCommit(args.tag)
  const commits = await git.getLogs('HEAD', lastTag)

  const commitsPR = commits.map(addPullRequestId)
  const commitsWithPR = commitsPR.filter(c => c.pullRequest.id != null)
  const commitsWithoutPR = commitsPR.filter(c => c.pullRequest.id == null)

  const github = GitHub(git.getRepoUrl())
  for (const commit of commitsWithPR) {
    const response = await github.getPRLabels(commit.pullRequest.id)
    const lables = response.data.map(_ => _.name)
    releaseBuilder.addLine(commit.message, lables)
  }

  commitsWithoutPR.forEach(_ => releaseBuilder.addLine(_.message))

  console.log(releaseBuilder.toString())
}

function addPullRequestId (logLine) {
  const id = getPRId(logLine)
  logLine.pullRequest = { id }
  return logLine
}

function getPRId (logLine) {
  const prIds = logLine.message.match(/#(\d{1,5})\)$/)
  if (prIds) {
    return prIds.pop()
  }
  return null
}
