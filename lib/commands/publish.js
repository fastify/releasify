'use strict'

const assert = require('assert').strict
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

const CLEAN_REPO = {
  not_added: [],
  conflicted: [],
  created: [],
  deleted: [],
  modified: [],
  renamed: [],
  files: [],
  staged: [],
  ahead: 0,
  behind: 0,
  // current: 'master',
  tracking: null
}

// TODO refactor to make optionals step (publish / push / release)
module.exports = async function (args) {
  validate(args, ARGS_SCHEMA)

  const logger = pino({ level: args.verbose, prettyPrint: true, base: null })

  const git = GitDirectory(args.path)
  const status = await git.status()
  try {
    const compare = { ...status }
    delete compare.current // ? should we check also the branch?
    assert.deepStrictEqual(compare, CLEAN_REPO, 'The git repo must be clean (committed and pushed) before releasing!')
  } catch (assert) {
    logger.debug({ status }, 'Complete repo status')
    throw assert
  }

  logger.debug('Building draft release..')
  const releasing = await draft(args)
  logger.info('Ready to release %s: %s --> %s', releasing.release, releasing.oldVersion, releasing.version)

  if (releasing.release === 'major' && args.major !== true) {
    throw new Error('You can not release a major version without --major flag')
  }

  const npm = Npm(args.path)
  await npm.ping() // check internet connection

  const registry = await npm.config('registry')
  const user = await npm.whoami()
  logger.info('User: %s is preparing to release in registry %s', user, registry)

  // check if the version we are releasing exists already
  const moduleLink = `${releasing.name}@${releasing.version}`
  let isAlreadyPublished = false
  try {
    isAlreadyPublished = (await npm.show(moduleLink, 'version')) !== ''
  } catch (error) {
    // if the module has been never released, the `show version` throws a 404
    logger.warn('Unable to find module link %s', moduleLink)
  }
  if (isAlreadyPublished) {
    throw new Error(`The module ${moduleLink} is already published in the registry ${registry}`)
  }
  logger.debug('The module %s is going to be published', moduleLink)

  // ? should use --allow-same-version (maybe someone want/has bumped manually)
  await npm.version(releasing.version)
  logger.debug('Bumped new version %s', releasing.version)

  // ! ******
  // ! DANGER ZONE: from this point if some error occurs we must explain to user what to do to fix

  // ? publish at the end??
  await npm.publish({ tag: args.tag, access: args.access })
  logger.info('Published new module version %s', moduleLink)

  let commited
  try {
    // NOTE: we are not creating and pushing any tags, it will be created by GitHub
    await git.add('package.json')
    commited = await git.commit(`Bumped v${releasing.version}`)
    logger.debug('Commit id %s on branch %s', commited.commit, commited.branch)

    const pushed = await git.push(args.gitRemote)
    logger.info('Pushed to git %o', pushed)

    // ? we could also create a branch, commit, push and do a PR.. is it worth?
  } catch (error) {
    logger.error(error)
    // TODO give the user the <releasign.message>
    throw new Error('Something went wrong pushing the package.json to git. The `npm publish` has been done! Check your `git status`')
  }

  try {
    const pkg = git.getRepoPackage()
    const github = GitHub({
      auth: args.ghToken,
      url: pkg.repository.url
    })
    const githubRelease = await github.createRelease({
      tag_name: `v${releasing.version}`,
      target_commitish: commited.commit,
      name: `v${releasing.version}`,
      body: releasing.message,
      draft: args.ghReleaseDraft,
      prerelease: args.ghReleasePrerelease
    })
    console.log({ githubRelease })

    logger.info('Created GitHub release: %s', githubRelease.http_url)
  } catch (error) {
    // TODO give the user the <releasign.message>
    throw new Error('Something went wrong creating the GitHub release. The `npm publish` has been done!')
  }

  return releasing
}
