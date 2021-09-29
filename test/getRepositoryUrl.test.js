'use strict'

const { test } = require('tap')
const getRepositoryUrl = require('../lib/getRepositoryUrl')

test('getRepositoryUrl', (t) => {
  test('returns url', (t) => {
    const url = getRepositoryUrl({
      getRepoPackage: () => ({
        repository: 'git+https://github.com/foo/bar.git'
      })
    })

    t.equal(url, 'git+https://github.com/foo/bar.git')

    const url2 = getRepositoryUrl({
      getRepoPackage: () => ({
        repository: {
          type: 'git',
          url: 'git+https://github.com/foo/bar.git'
        }
      })
    })

    t.equal(url2, 'git+https://github.com/foo/bar.git')
    t.end()
  })

  test('throws when repository is missing', (t) => {
    t.throws(() => {
      getRepositoryUrl({
        getRepoPackage: () => ({})
      })
    })
    t.end()
  })
  t.end()
})
