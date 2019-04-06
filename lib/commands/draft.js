'use strict'

const GitDirectory = require('../git-directory')
const GitHub = require('../github')
const releaseBuilder = require('../release-message')()

// node lib/cli.js draft -p '../fastify_1.x/' -t v1.*
module.exports = async function (args) {
  const git = GitDirectory(args.path)

  const lastTag = await git.getLastTagCommit(args.tag)
  const commits = await git.getLogs('HEAD', lastTag)

  const commitsPrMap = new Map(commits.map(addPRId))

  const github = GitHub(git.getRepoUrl())
  const labelsGenerator = github.getPRLabels(commits.map(getPRId))
  for (const labelsRequest of labelsGenerator) {
    const response = await labelsRequest
    releaseBuilder.addLine(commitsPrMap.get(response.pullRequest.id), response.data.map(_ => _.name))
  }

  releaseBuilder.print()
}

function addPRId (logLine) {
  const pr = getPRId(logLine)
  // TODO what if the PR is not found?
  return [pr, logLine]
}

function getPRId (logLine) {
  // TODO manage messages like "backport #123 (#124)"
  return logLine.message.match(/#(\d{1,5})/m).pop()
}
