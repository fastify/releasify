'use strict'

module.exports = function buildReleaseMessage () {
  const semverBuckets = {
    list: []
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
    semverBuckets.list.push(message)
  }

  function toString () {
    return semverBuckets.list.reduceRight((out, item) => {
      out += `- ${item}\n`
      return out
    }, '📚 PR:\n')
  }
}
