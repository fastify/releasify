'use strict'

const semver = require('semver')

module.exports = function releaseBuilder () {
  const semverBuckets = {
    list: []
  }

  let currentVersion
  let newVersion

  return {
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
    semverBuckets.list.push(message)
  }

  function suggestRelease () {
    // TODO suggest a release: based on the labels added previously
    return 'unpredictable'
  }

  function bump (release) {
    newVersion = semver.inc(currentVersion, release) || currentVersion
    return newVersion
  }

  function build () {
    return {
      version: newVersion,
      oldVersion: currentVersion,
      message: toString()
    }
  }

  function toString () {
    return semverBuckets.list.reduceRight((out, item) => {
      out += `- ${item}\n`
      return out
    }, '📚 PR:\n')
  }
}
