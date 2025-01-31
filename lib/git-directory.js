'use strict'

const { join } = require('node:path')
const { readFileSync } = require('node:fs')
const { promisify } = require('node:util')
const SimpleGit = require('simple-git')

module.exports = function gitDirectory (path) {
  const cwd = SimpleGit(path)

  const gitTag = promisify(cwd.tag.bind(cwd))
  const gitLog = promisify(cwd.log.bind(cwd))
  const gitStatus = promisify(cwd.status.bind(cwd))
  const gitAdd = promisify(cwd.add.bind(cwd))
  const gitCommit = promisify(cwd.commit.bind(cwd))
  const gitPush = promisify(cwd.push.bind(cwd))
  const gitPull = promisify(cwd.pull.bind(cwd))

  return {
    getRepoPackage,
    getLastTagCommit,
    getLogs,
    status,
    add,
    commit,
    pull,
    push
  }

  function getRepoPackage () {
    const packageFile = readFileSync(join(path, 'package.json'), 'utf8')
    return JSON.parse(packageFile)
  }

  /**
   * Execute the command:
   * `git tag --format='%(objectname) %(refname:strip=2)' --sort=-version:refname -l v1* | head -n1`
   *
   * @param {string} tagPattern
   * @returns {string} the commit hash
   */
  async function getLastTagCommit (tagPattern) {
    const out = await gitTag([
      '--format=%(objectname)',
      '--sort=version:refname',
      '-l',
      tagPattern
    ])
    // the output is like in the bash
    const tags = out.trim().split('\n')
    return tags.pop()
  }

  /**
   * Execute the command:
   * git log --pretty=oneline HEAD...`git tag --format='%(objectname)' --sort=-version:refname -l v1* | head -n1`
   *
   * @param {string} fromCommit
   * @param {string} toCommit
   * @return {Array<ListLogLine>} commits
   */
  async function getLogs (fromCommit, toCommit) {
    const logs = await gitLog({
      from: fromCommit,
      to: toCommit
    })
    return logs.all
  }

  function status () {
    // git diff-index origin/main
    // git diff-index <arg.remote>/<arg.branch>
    // git status --short
    // git status --porcelain

    return gitStatus()
  }

  function add (files) {
    return gitAdd(files)
  }

  function commit ({ message, noVerify }) {
    const options = {}
    if (noVerify === true) {
      options['--no-verify'] = null
    }
    return gitCommit(message, options)
  }

  function push (remote = 'origin') {
    return gitPush(remote)
  }

  function pull (remote = 'origin') {
    return gitPull(remote)
  }
}
