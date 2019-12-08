'use strict'

const semver = require('semver')

module.exports = function releaseBuilder (moduleName, { labels }) {
  const groupLabels = labels
  const semverBuckets = {
    list: []
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
      const addedTo = labels.reduce((adds, l) => {
        if (semverBuckets[l]) {
          semverBuckets[l].push(message)
          return adds + 1
        }
      }, 0)

      if (addedTo > 0) {
        return
      }
    }

    semverBuckets.list.push(message)
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
      lines: semverBuckets.list.length
    }
  }

  function toString () {
    if (groupLabels.length) {
      return groupLabels.reduce((out, label) => {
        out += `${label}:\n${semverBuckets[label].reduceRight(listCommits, '')}\n\n`
        return out
      }, '')
    }

    return semverBuckets.list.reduceRight(listCommits, '📚 PR:\n')
  }

  function listCommits (out, item) {
    out += `- ${item}\n`
    return out
  }
}
