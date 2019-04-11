'use strict'

const { join } = require('path')
const { readFileSync } = require('fs')
const { promisify } = require('util')
const SimpleGit = require('simple-git')

module.exports = function gitDirectory (path) {
  const cwd = SimpleGit(path)
  let packageJson

  return {
    getRepoPackage,
    getLastTagCommit,
    getLogs,
    status,
    add,
    commit,
    push
  }

  function getRepoPackage () {
    if (packageJson) {
      return packageJson
    }
    // lazy loading
    const packageFile = readFileSync(join(path, 'package.json'), 'utf8')
    packageJson = JSON.parse(packageFile)
    return packageJson
  }

  /**
   * Execute the command:
   * `git tag --format='%(objectname) %(refname:strip=2)' --sort=-version:refname -l v1* | head -n1`
   *
   * @param {string} tagPattern
   * @returns {string} the commit hash
   */
  async function getLastTagCommit (tagPattern) {
    const gitTag = promisify(cwd.tag.bind(cwd))
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
    const gitLog = promisify(cwd.log.bind(cwd))
    const logs = await gitLog({
      from: fromCommit,
      to: toCommit
    })
    return logs.all
  }

  function status () {
    // git diff-index origin/master
    // git diff-index <arg.remote>/<arg.branch>
    // git status --short
    // git status --porcelain
    const gitStatus = promisify(cwd.status.bind(cwd))
    return gitStatus()
  }

  function add (files) {
    const gitAdd = promisify(cwd.add.bind(cwd))
    return gitAdd(files)
  }

  function commit (message) {
    const gitCommit = promisify(cwd.commit.bind(cwd))
    return gitCommit(message)
  }

  function push (remote = 'origin') {
    const gitPush = promisify(cwd.push.bind(cwd))
    return gitPush(remote)
  }
}
