'use strict'

module.exports = function buildReleaseMessage () {
  const semverBuckets = {
    brakingChanges: [],
    feature: [],
    bugfix: [],
    mixed: []
  }

  return {
    addLine,
    print
  }

  /**
   *
   * @param {string} message
   * @param {Array} labels
   */
  function addLine (message, labels = []) {
    if (labels.includes('bugfix')) {
      semverBuckets.bugfix.push(message)
    } else if (labels.includes('semver-minor')) {
      semverBuckets.feature.push(message)
    } else if (labels.includes('semver-major')) {
      semverBuckets.brakingChanges.push(message)
    } else {
      semverBuckets.mixed.push(message)
    }
  }

  function print () {
    console.log(JSON.stringify(semverBuckets, null, 2))
  }
}
