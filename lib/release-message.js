'use strict'

module.exports = function buildReleaseMessage () {
  const semverBuckets = {
    breakingChanges: [],
    feature: [],
    bugfix: [],
    mixed: []
  }

  return {
    addLine,
    toString
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
      semverBuckets.breakingChanges.push(message)
    } else {
      semverBuckets.mixed.push(message)
    }
  }

  function toString () {
    return printChangelog`🌟 Breaking changes:
${semverBuckets.breakingChanges}

🚀 Features:
${semverBuckets.feature}

🐛 Fixed:
${semverBuckets.bugfix}

🔍 Others:
${semverBuckets.mixed}`
  }

  function printChangelog (headers, ...changeList) {
    let out = ''

    for (const head in headers) {
      const changes = changeList[head]
      if (!changes || changes.length === 0) {
        continue
      }

      out += `${headers[head]}\n`
      for (const msg of changes) {
        out += `+ ${msg}\n`
      }
    }
    return out
  }
}
