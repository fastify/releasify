'use strict'

const SimpleGit = require('simple-git')

module.exports = function gitDirectory (path) {
  const cwd = SimpleGit(path)

  return {
    getLastTagCommit,
    getLogs
  }

  /**
   * Execute the command:
   * `git tag --format='%(objectname) %(refname:strip=2)' --sort=-version:refname -l v1* | head -n1`
   *
   * @param {string} tagPattern
   * @returns {string} the commit hash
   */
  function getLastTagCommit (tagPattern) {
    return new Promise((resolve, reject) => {
      cwd.tag([
        '--format=%(objectname)',
        '--sort=version:refname',
        '-l',
        tagPattern
      ], (err, out) => {
        if (err) {
          return reject(err)
        }

        // the output is like in the bash
        const tags = out.trim().split('\n')
        resolve(tags.pop())
      })
    })
  }

  /**
   * Execute the command:
   * git log --pretty=oneline HEAD...`git tag --format='%(objectname)' --sort=-version:refname -l v1* | head -n1`
   *
   * @param {string} fromCommit
   * @param {string} toCommit
   * @return {Array<ListLogLine>} commits
   */
  function getLogs (fromCommit, toCommit) {
    return new Promise((resolve, reject) => {
      cwd.log({
        from: fromCommit,
        to: toCommit
      }, (err, res) => {
        if (err) {
          return reject(err)
        }
        resolve(res.all)
      })
    })
  }
}
