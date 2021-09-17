'use strict'

const assert = require('assert').strict
const pino = require('pino')
const { validate } = require('../validation')
const draft = require('./draft')
const Npm = require('../npm')
const GitDirectory = require('../git-directory')
const GitHub = require('../github')
const { editMessage } = require('../editor')
const debug = require('debug')

// TODO this could be optimized with a common schema using $ref..
const ARGS_SCHEMA = {
  type: 'object',
  required: ['path', 'verbose', 'major', 'remote', 'branch', 'semver', 'ghToken'],
  properties: {
    major: { type: 'boolean' },
    help: { type: 'boolean' },
    dryRun: { type: 'boolean' },
    ghReleaseEdit: { type: 'boolean' },
    ghReleaseDraft: { type: 'boolean' },
    ghReleasePrerelease: { type: 'boolean' },
    path: { type: 'string' },
    tag: { type: 'string' },
    remote: { type: 'string' },
    branch: { type: 'string' },
    ghToken: {
      type: 'string',
      minLength: 40
    },
    verbose: {
      type: 'string',
      enum: ['trace', 'debug', 'info', 'warn', 'error']
    },
    npmAccess: {
      type: 'string',
      enum: ['public', 'restricted']
    },
    npmDistTag: {
      type: 'string',
      pattern: '^[^v0-9][\\w]{1,12}'
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
  tracking: null
}

// TODO refactor to make optionals step (publish / push / release)
module.exports = async function (args) {
  validate(args, ARGS_SCHEMA)

  const logger = pino({ level: args.verbose, prettyPrint: true, base: null })

  if (args.verbose === 'trace') {
    debug.enable('simple-git,simple-git:*')
  }

  const git = GitDirectory(args.path)
  const status = await git.status()
  const compare = { ...status }
  delete compare.current // the current branch could be named in a different way
  CLEAN_REPO.tracking = `${args.remote}/${args.branch}` // your local branch must track where you will push
  logger.debug('Complete repo status %s', inlineNotEmpty(status))
  assert.deepStrictEqual(compare, CLEAN_REPO, 'The git repo must be clean (committed and pushed) before releasing!')

  logger.debug('Building draft release..')
  const releasing = await draft(args)
  logger.info('Ready to release %s: %s --> %s', releasing.release, releasing.oldVersion, releasing.version)

  if (releasing.lines === 0) {
    throw new Error('There are ZERO commit to release!')
  }

  // TODO check the validity of the GH-TOKEN.. need another param with the github account:
  // https://octokit.github.io/rest.js/#api-OauthAuthorizations-checkAuthorization

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
    isAlreadyPublished = (await npm.show(moduleLink, 'version')) === releasing.version
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
  await npm.publish({ tag: args.npmDistTag, access: args.npmAccess, otp: args.npmOtp })
  logger.info('Published new module version %s', moduleLink)

  let commited
  try {
    // NOTE: we are not creating and pushing any tags, it will be created by GitHub
    // NOTE 2: If we don't bump any version we aren't committing any change (ex: first release and version already set)
    await git.add('package.json')
    commited = await git.commit({ message: `Bumped v${releasing.version}`, noVerify: args.noVerify })
    logger.debug('Commit id %s on branch %s', commited.commit, commited.branch)

    await git.push(args.remote)
    logger.info('Pushed to git %s', args.remote)
  } catch (error) {
    logger.error(error)
    const messageError = `Something went wrong pushing the package.json to git.
The 'npm publish' has been done! Check your 'git status' and if necessary run 'npm unpublish ${moduleLink}'.
Consider creating a release on GitHub by yourself with this message:\n${releasing.message}`
    throw new Error(messageError)
  }

  try {
    const pkg = git.getRepoPackage()
    const github = GitHub({
      auth: args.ghToken,
      url: pkg.repository.url
    }, logger)

    if (args.ghReleaseEdit) {
      logger.debug('Waiting for user to edit the release message..')
      releasing.message = await editMessage(releasing.message, 'edit-release-message.md')
    }

    logger.debug('Creating release on GitHub..')
    const githubRelease = await github.createRelease({
      tag_name: `v${releasing.version}`,
      target_commitish: commited.branch,
      name: `v${releasing.version}`,
      body: releasing.message,
      draft: args.ghReleaseDraft,
      prerelease: args.ghReleasePrerelease
    })
    logger.info('Created GitHub release: %s', (githubRelease && githubRelease.data && githubRelease.data.html_url))
  } catch (error) {
    logger.error(error)
    const messageError = `Something went wrong creating the release on GitHub.
The 'npm publish' and 'git push' has been done!
Consider creating a release on GitHub by yourself with this message:\n${releasing.message}`
    throw new Error(messageError)
  }

  try {
    await git.pull(args.remote)
    logger.debug('Pulled new tags from remote: %s', args.remote)
  } catch (error) {
    logger.warn('Unable to pull the new release tag due: %s', error.message)
  }

  return releasing
}

function inlineNotEmpty (json) {
  return Object.keys(json).reduce((msg, k) => {
    const v = json[k]
    // only array with almost 1 element, string and numbers > 0
    if ((v.length && v.length > 0) || v > 0) {
      msg += `${k}=${JSON.stringify(v)} `
    }
    return msg
  }, '')
}
