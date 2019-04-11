'use strict'

const pino = require('pino')
const { validate } = require('../validation')
const GitDirectory = require('../git-directory')
const GitHub = require('../github')
const ReleaseBuilder = require('../release-builder')

const ARGS_SCHEMA = {
  type: 'object',
  required: ['path', 'verbose'],
  properties: {
    help: { type: 'boolean' },
    path: { type: 'string' },
    tag: { type: 'string' },
    verbose: {
      type: 'string',
      enum: [ 'debug', 'info', 'warn', 'error' ]
    },
    semver: {
      type: 'string',
      enum: [ 'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease' ]
    }
  }
}

module.exports = async function (args) {
  validate(args, ARGS_SCHEMA)

  const logger = pino({ level: args.verbose, prettyPrint: true, base: null })
  logger.debug('Reading the project in %s', args.path)
  const git = GitDirectory(args.path)

  const pkg = git.getRepoPackage()
  const releaseBuilder = ReleaseBuilder(pkg.name)
  releaseBuilder.setCurrentVersion(pkg.version)
  logger.debug('Found %s version: %s', releaseBuilder.getName(), releaseBuilder.getCurrentVersion())

  const tagPattern = args.tag || `v${releaseBuilder.getCurrentVersionInfo().major}\\.[0-9]*\\.[0-9]*`
  logger.debug('Searching for tag pattern %s', tagPattern)

  const lastTagCommit = await git.getLastTagCommit(tagPattern)
  const commits = await git.getLogs('HEAD', lastTagCommit)
  logger.debug('Found %d commits from HEAD to %s', commits.length, lastTagCommit)

  const commitsPR = commits.map(addPullRequestId)
  const commitsWithPR = commitsPR.filter(c => c.pullRequest.id != null)
  const commitsWithoutPR = commitsPR.filter(c => c.pullRequest.id == null)
  logger.debug('There are %d commits message that contain a PR id and %d don\'t', commitsWithPR.length, commitsWithoutPR.length)

  const github = GitHub({ url: pkg.repository.url })
  logger.info('Getting PR labels from GitHub..')
  for (const commit of commitsWithPR) {
    try {
      const response = await github.getPRLabels(commit.pullRequest.id)
      const labels = response.data.map(_ => _.name)
      logger.debug('\tGet PR %s labels %o', commit.pullRequest.id, labels)
      releaseBuilder.addLine(commit.message, labels)
    } catch (error) {
      logger.warn(error, '\tError getting PR %s', commit.pullRequest.id)
      releaseBuilder.addLine(commit.message, [])
    }
  }

  // don't miss any commit
  commitsWithoutPR.forEach(_ => releaseBuilder.addLine(_.message))

  const neverReleased = !lastTagCommit
  const release = args.semver || (neverReleased ? 'none' : releaseBuilder.suggestRelease())
  logger.debug('New semver to apply: %s', release)

  const newVersion = releaseBuilder.bump(release)
  logger.info('Applied %s version to project: %s', release, newVersion)

  return releaseBuilder.build()
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
