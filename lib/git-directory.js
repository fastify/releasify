'use strict'

const { join } = require('path')
const { readFileSync } = require('fs')
const { promisify } = require('util')
const SimpleGit = require('simple-git')

module.exports = function gitDirectory (path) {
  const cwd = SimpleGit(path)

  return {
    getLastTagCommit,
    getLogs,
    getRepoUrl: () => getSyncRepoUrl(path)
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
}

function getSyncRepoUrl (path) {
  const packageJson = readFileSync(join(path, 'package.json'), 'utf8')
  return JSON.parse(packageJson).repository.url
}
