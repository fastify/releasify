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
    semver: null
  }
  return Object.assign({}, options)
}

test('mandatory options', t => {
  t.plan(2)
  t.rejects(() => cmd({}), new Error("should have required property 'path',  should have required property 'fromCommit',  should have required property 'verbose'"))
  t.rejects(() => cmd(buildOptions()), new Error('.tag should be string, .semver should be string, .semver should be equal to one of the allowed values'))
})

test('draft a version forced release', async t => {
  t.plan(4)

  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  opts.semver = 'major'
  delete opts.tag // autosense

  const build = await cmd(opts)
  t.equals(build.name, 'fake-project')
  t.equals(build.version, '12.0.0')
  t.equals(build.oldVersion, '11.14.42')
  t.equals(build.message, '📚 PR:\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n')
})

test('draft a suggested release', async t => {
  t.plan(2)

  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  delete opts.tag // autosense
  delete opts.semver // auto-calculate

  const build = await cmd(opts)
  // TODO: now the suggestedRelease is not implemented
  t.equals(build.version, '11.14.42')
  t.equals(build.oldVersion, '11.14.42')
})

test('draft the first release', async t => {
  t.plan(3)

  const cmd = h.buildProxyCommand('../lib/commands/draft', {
    git: {
      tag: {
        history: 0,
        inputChecker (tagArgs) {
          t.strictDeepEqual(tagArgs, [
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
  t.equals(build.version, '11.14.42')
  t.equals(build.oldVersion, '11.14.42')
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
          t.strictDeepEqual(labelsArgs, { owner: 'foo', repo: 'bar', issue_number: '12345' })
        }
      }
    }
  })
  const opts = buildOptions()
  opts.path = join(__dirname, 'fake-project/')
  opts.tag = 'bad-pattern'
  delete opts.semver // auto-calculate

  const build = await cmd(opts)
  t.equals(build.version, '11.14.42')
  t.equals(build.oldVersion, '11.14.42')
})
