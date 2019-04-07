'use strict'

const semver = require('semver')

const GitDirectory = require('../git-directory')
const GitHub = require('../github')
const ReleaseBuilder = require('../release-message')

module.exports = async function (args) {
  // TODO validate args

  const git = GitDirectory(args.path)

  const lastTag = await git.getLastTagCommit(args.tag)
  const commits = await git.getLogs('HEAD', lastTag)

  // TODO validate the version match between tags

  const commitsPR = commits.map(addPullRequestId)
  const commitsWithPR = commitsPR.filter(c => c.pullRequest.id != null)
  const commitsWithoutPR = commitsPR.filter(c => c.pullRequest.id == null)

  const releaseBuilder = ReleaseBuilder()

  const github = GitHub(git.getRepoUrl())
  for (const commit of commitsWithPR) {
    const response = await github.getPRLabels(commit.pullRequest.id)
    const lables = response.data.map(_ => _.name)
    releaseBuilder.addLine(commit.message, lables)
  }

  commitsWithoutPR.forEach(_ => releaseBuilder.addLine(_.message))

  // TODO understand the release type based on labels
  const vActual = git.getRepoPackage().version
  const release = args.semver || 'minor'
  const vFuture = semver.inc(vActual, release)

  // TODO normalize the output
  console.log(`The new ${release} version must be: ${vFuture}`)

  return releaseBuilder.toString()
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
