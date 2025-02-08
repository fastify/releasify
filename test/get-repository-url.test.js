'use strict'

const { test } = require('node:test')
const getRepositoryUrl = require('../lib/get-repository-url')

test('getRepositoryUrl', async (t) => {
  await t.test('returns url', (t) => {
    const url = getRepositoryUrl({
      getRepoPackage: () => ({
        repository: 'git+https://github.com/foo/bar.git'
      })
    })

    t.assert.deepStrictEqual(url, 'git+https://github.com/foo/bar.git')

    const url2 = getRepositoryUrl({
      getRepoPackage: () => ({
        repository: {
          type: 'git',
          url: 'git+https://github.com/foo/bar.git'
        }
      })
    })

    t.assert.deepStrictEqual(url2, 'git+https://github.com/foo/bar.git')
  })

  await t.test('throws when repository is missing', (t) => {
    t.assert.throws(() => {
      getRepositoryUrl({
        getRepoPackage: () => ({})
      })
    })
  })
})
