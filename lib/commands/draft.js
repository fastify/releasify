'use strict'

const simpleGit = require('simple-git')('../fastify_1.x/')

module.exports = async function (args) {
  // TODO

  //   ## take last tag released NOTE: need a pattern input (v1*)
  // git tag --format='%(objectname) %(refname:strip=2)' --sort=-version:refname -l v1* | head -n1
  // 6db56c4021632a487af56d2a45630f25bf55f33c

  // ## find the diff
  // git log --pretty=oneline HEAD...`git tag --format='%(objectname)' --sort=-version:refname -l v1* | head -n1`

  // ## extract the PR IDs
  // /(#\d{1,5})/gm

  // ## ask the labels to GITHUB
  // https://developer.github.com/v3/pulls/#get-a-single-pull-request

  // ## analyze the labels to choose from [major, minor, patch]
  // print out the result
  // [NOTE for PUBLISH command] if major => block it (unless there is a boolean option)

  // ## print out the GITHUB Release string message
  // print out the result
  // [NOTE for PUBLISH command] https://developer.github.com/v3/repos/releases/

  simpleGit.tag([
    '--format=%(objectname)',
    '--sort=version:refname',
    '-l',
    'v1*'
  ], (err, out) => {
    console.log({ res1: err })

    const tags = out.split('\n')
    tags.pop()
    const lastTag = tags.pop()

    simpleGit.log('HEAD', lastTag, (err, res) => {
      console.log({ res })
      res.all.forEach(element => {
        console.log({ element })
      })
    })
  })
}
