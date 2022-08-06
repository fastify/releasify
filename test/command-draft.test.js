'use strict'

const t = require('tap')
const { join } = require('path')
const h = require('./helper')

const cmd = h.buildProxyCommand('../lib/commands/draft', {
  git: { tag: { history: 5 } },
  github: { }, // default OK
  npm: { } // default OK
})

const { test } = t

function buildOptions () {
  const options = {
    path: 'a/path',
    tag: null,
    verbose: 'error',
    fromCommit: 'HEAD',
    semver: null,
    ghGroupByLabel: []
  }
  return Object.assign({}, options)
}

test('mandatory options', t => {
  t.plan(2)
  t.rejects(() => cmd({}), new Error("must have required property 'path',  must have required property 'fromCommit',  must have required property 'verbose'"))
  t.rejects(() => cmd(buildOptions()), new Error('.tag must be string, .semver must be string, .semver must be equal to one of the allowed values'))
})

test('draft a version forced release', async t => {
  t.plan(4)

  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  opts.semver = 'major'
  delete opts.tag // autosense

  const build = await cmd(opts)
  t.equal(build.name, 'fake-project')
  t.equal(build.version, '12.0.0')
  t.equal(build.oldVersion, '11.14.42')
  t.equal(build.message, '📚 PR:\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n')
})

test('draft a suggested release', async t => {
  t.plan(2)

  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  delete opts.tag // autosense
  delete opts.semver // auto-calculate

  const build = await cmd(opts)
  // TODO: now the suggestedRelease is not implemented
  t.equal(build.version, '11.14.42')
  t.equal(build.oldVersion, '11.14.42')
})

test('draft a range commit release message', async t => {
  t.plan(1)

  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  const commitHash = '123abc'.repeat(6)
  opts.fromCommit = `${commitHash}4`
  opts.toCommit = `${commitHash}7`
  delete opts.tag // autosense
  delete opts.semver // auto-calculate

  const cmd = h.buildProxyCommand('../lib/commands/draft', {
    git: {
      tag: { inputChecker () { t.fail('this function must not be called') } },
      log: {
        inputChecker (logArgs) {
          t.strictSame(logArgs, {
            from: opts.fromCommit,
            to: opts.toCommit
          })
        }
      }
    }, // generate 10 commit history
    github: { }, // default OK
    npm: { } // default OK
  })

  await cmd(opts)
})

test('draft a range commit release message when toCommit not specified and no tags', async t => {
  t.plan(1)

  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  const commitHash = '123abc'.repeat(6)
  opts.fromCommit = `${commitHash}4`
  delete opts.toCommit
  opts.tag = 'bad-pattern' // no tags
  delete opts.semver // auto-calculate

  const cmd = h.buildProxyCommand('../lib/commands/draft', {
    git: {
      tag: { history: 0 },
      log: {
        inputChecker (logArgs) {
          t.strictSame(logArgs, {
            from: opts.fromCommit,
            to: 'HEAD'
          })
        }
      }
    },
    github: { }, // default OK
    npm: { } // default OK
  })

  await cmd(opts)
})

test('draft the first release', async t => {
  t.plan(3)

  const cmd = h.buildProxyCommand('../lib/commands/draft', {
    git: {
      tag: {
        history: 0,
        inputChecker (tagArgs) {
          t.strictSame(tagArgs, [
            '--format=%(objectname)',
            '--sort=version:refname',
            '-l',
            'bad-pattern'
          ])
        }
      }
    }
  })
  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  opts.tag = 'bad-pattern'
  delete opts.semver // auto-calculate

  const build = await cmd(opts)
  t.equal(build.version, '11.14.42')
  t.equal(build.oldVersion, '11.14.42')
})

test('error management getting PR: works but won\' apply labels', async t => {
  t.plan(3)

  const cmd = h.buildProxyCommand('../lib/commands/draft', {
    git: {
      tag: { history: 2 },
      log: { messages: ['this is a message without PR', 'this is a message with PR (#12345)'] }
    },
    github: {
      labels: {
        throwError: true,
        inputChecker (labelsArgs) {
          t.strictSame(labelsArgs, { owner: 'foo', repo: 'bar', issue_number: '12345' })
        }
      }
    }
  })
  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  opts.tag = 'bad-pattern'
  delete opts.semver // auto-calculate

  const build = await cmd(opts)
  t.equal(build.version, '11.14.42')
  t.equal(build.oldVersion, '11.14.42')
})

test('group changelog message by labels', async t => {
  t.plan(1)

  const prLabels = [
    [{ name: 'bugfix' }], // #2
    [{ name: 'bugfix' }, { name: 'documentation' }], // #3
    [{ name: 'feature' }], // #4
    [{ name: 'typescript' }] // #5
  ]

  const dataRulette = {}
  Object.defineProperty(dataRulette, 'data', {
    get: function () { return prLabels.pop() }
  })

  const cmd = h.buildProxyCommand('../lib/commands/draft', {
    git: {
      tag: { history: 5 },
      log: {
        messages: [
          'one this is a message without PR',
          'two this is a bugfix (#2)',
          'three this is a doc bugfix (#3)',
          'four this is feature (#4)',
          'five this is a typescript pr (#5)'
        ]
      }
    },
    github: {
      labels: dataRulette
    }
  })
  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  opts.ghGroupByLabel = ['feature', 'bugfix', 'documentation']
  delete opts.tag // autosense
  delete opts.semver // auto-calculate

  const build = await cmd(opts)
  t.equal(build.message,
    `**feature**:
- four this is feature (#4)


**bugfix**:
- two this is a bugfix (#2)
- three this is a doc bugfix (#3)


**commit**:
- one this is a message without PR
- five this is a typescript pr (#5)


`)
})

test('group changelog order', async t => {
  t.plan(1)

  const prLabels = [
    [{ name: 'bugfix' }], // #2
    [{ name: 'bugfix' }, { name: 'documentation' }], // #3
    [{ name: 'feature' }], // #4
    [{ name: 'typescript' }] // #5
  ]

  const dataRulette = {}
  Object.defineProperty(dataRulette, 'data', {
    get: function () { return prLabels.pop() }
  })

  const cmd = h.buildProxyCommand('../lib/commands/draft', {
    git: {
      tag: { history: 5 },
      log: {
        messages: [
          'one this is a message without PR',
          'two this is a bugfix (#2)',
          'three this is a doc bugfix (#3)',
          'four this is feature (#4)',
          'five this is a typescript pr (#5)'
        ]
      }
    },
    github: {
      labels: dataRulette
    }
  })
  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  opts.ghGroupByLabel = ['documentation', 'feature', 'bugfix']
  delete opts.tag // autosense
  delete opts.semver // auto-calculate

  const build = await cmd(opts)
  t.equal(build.message,
    `**documentation**:
- three this is a doc bugfix (#3)


**feature**:
- four this is feature (#4)


**bugfix**:
- two this is a bugfix (#2)


**commit**:
- one this is a message without PR
- five this is a typescript pr (#5)


`)
})
