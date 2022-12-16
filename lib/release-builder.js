'use strict'

const semver = require('semver')

module.exports = function releaseBuilder (moduleName, { labels, releaseBody }) {
  const groupLabels = labels
  const semverBuckets = {
    commit: []
  }

  groupLabels.forEach(l => {
    semverBuckets[l] = []
  })

  const name = moduleName
  let currentVersion
  let newVersion
  let releaseType

  return {
    getName () { return name },
    setCurrentVersion,
    getCurrentVersion,
    getCurrentVersionInfo,
    suggestRelease,
    addLine,
    bump,
    build,
    toString
  }

  function setCurrentVersion (version) { currentVersion = semver.clean(version) }
  function getCurrentVersion () { return currentVersion }
  function getCurrentVersionInfo () { return semver.minVersion(currentVersion) }

  /**
   *
   * @param {string} message
   * @param {Array} labels
   */
  function addLine (message, labels = []) {
    if (labels.length) {
      const bucket = groupLabels.find(gl => labels.includes(gl))
      if (bucket) {
        semverBuckets[bucket].push(message)
        return
      }
    }

    semverBuckets.commit.push(message)
  }

  function suggestRelease () {
    // TODO suggest a release: based on the labels added previously
    return 'unpredictable'
  }

  function bump (release) {
    newVersion = semver.inc(currentVersion, release) || currentVersion
    releaseType = release
    return newVersion
  }

  function build () {
    return {
      name,
      release: releaseType,
      version: newVersion,
      oldVersion: currentVersion,
      message: toString(),
      lines: Object.values(semverBuckets).reduce((sum, bucket) => { return sum + bucket.length }, 0)
    }
  }

  function toString () {
    if (releaseBody) { return undefined }
    if (groupLabels.length) {
      return [...groupLabels, 'commit']
        .reduce((out, label) => {
          const commitList = semverBuckets[label].reduceRight(listCommits, '')
          if (commitList) {
            out += `**${label}**:\n${commitList}\n\n`
          }
          return out
        }, '')
    }

    return semverBuckets.commit.reduceRight(listCommits, '📚 PR:\n')
  }

  function listCommits (out, item) {
    out += `- ${item}\n`
    return out
  }
}
