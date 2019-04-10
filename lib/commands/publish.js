'use strict'

const pino = require('pino')
const { validate } = require('../validation')
const draft = require('./draft')
const Npm = require('../npm')
const GitDirectory = require('../git-directory')
const GitHub = require('../github')

// TODO optimize: replicated from draft
const ARGS_SCHEMA = {
  type: 'object',
  required: ['path', 'verbose', 'major'],
  properties: {
    major: { type: 'boolean' },
    help: { type: 'boolean' },
    path: { type: 'string' },
    tag: { type: 'string' },
    verbose: {
      type: 'string',
      enum: ['debug', 'info', 'warn', 'error']
    },
    access: {
      type: 'string',
      enum: ['public', 'restricted']
    },
    semver: {
      type: 'string',
      enum: ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease']
    }
  }
}

module.exports = async function (args) {
  validate(args, ARGS_SCHEMA)

  const logger = pino({ level: args.verbose, prettyPrint: true, base: null })

  // TODO check git status
  const git = GitDirectory(args.path)
  // git diff-index origin/master
  // git diff-index <arg.remote>/<arg.branch>
  // git status --short
  // git status --porcelain

  logger.debug('Building draft release..')
  const releasing = await draft(args)
  logger.info('Ready to release %s: %s --> %s', releasing.release, releasing.oldVersion, releasing.version)

  if (releasing.release === 'major' && args.major !== true) {
    throw new Error('You can not release a major version without --major flag')
  }

  const npm = Npm(args.path)
  await npm.ping() // check internet connection
  const user = await npm.whoami() // check logged user
  logger.info('User: %s is preparing to release', user)

  // check if the version we are releasing exists already
  const moduleLink = `${releasing.name}@${releasing.version}`
  const isAlreadyPublished = (await npm.show(moduleLink)) !== ''
  if (isAlreadyPublished) {
    throw new Error(`The module ${moduleLink} is already published the registry`)
  }
  logger.debug('The module %s is going to be published', moduleLink)

  // ? should we bump the release manually? In this case we should commit the changes by ourself
  // --no-git-tag-version
  // https://docs.npmjs.com/cli/version.html
  await npm.version(releasing.version)
  logger.info('Bumped new version')

  // npm publish <args.path> --tag <args.tag> --access <args.access>
  logger.info('Published new version')

  // TODO git push + WITHOUT tag (it will be create by the GitHub Release)
  // git push
  // git push <arg.remote> <relesing.version>
  logger.info('Pushed to git')

  // TODO github create release
  const pkg = git.getRepoPackage()
  const github = GitHub(pkg.repository.url)
  await github.createRelease()
  logger.info('Create GitHub release %s', 'url-TODO')

  return releasing
}
