'use strict'

const { EventEmitter } = require('events')
const t = require('tap')
const { join } = require('path')
const proxyquire = require('proxyquire')
const h = require('./helper')

const cmd = h.buildProxyCommand('../lib/commands/publish', {
  git: { tag: { history: 5 } },
  github: { }, // default OK
  npm: { } // default OK
})

const { test } = t

function buildOptions () {
  // TODO optimize using args instead
  const options = {
    path: join(__dirname, 'fake-project/'),
    tag: null,
    verbose: 'error',
    semver: null,
    major: false,
    remote: 'origin',
    branch: 'master',
    fromCommit: 'HEAD',
    ghToken: 'INVALID_TOKEN'
  }
  return Object.assign({}, options)
}

test('mandatory options', t => {
  t.plan(2)
  t.rejects(() => cmd({}), new Error(" should have required property 'major',  should have required property 'path',  should have required property 'remote',  should have required property 'branch',  should have required property 'ghToken',  should have required property 'verbose',  should have required property 'semver'"))
  t.rejects(() => cmd(buildOptions()), new Error('.tag should be string, .ghToken should NOT be shorter than 40 characters, .semver should be string, .semver should be equal to one of the allowed values'))
})

test('try to publish a repo not sync', t => {
  t.plan(1)
  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    git: { status: { dirty: true } }
  })
  const opts = buildOptions()
  opts.semver = 'patch'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag
  t.rejects(() => cmd(opts), new Error('The git repo must be clean (committed and pushed) before releasing!'))
})

test('try to publish 0 new commits', t => {
  t.plan(1)
  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 0 } } }) }
  })
  const opts = buildOptions()
  opts.semver = 'patch'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag
  t.rejects(() => cmd(opts), new Error('There are ZERO commit to relase!'))
})

test('try to publish with a wrong token', t => {
  t.plan(1)
  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 1 } } }) }
  })
  const opts = buildOptions()
  opts.semver = 'patch'
  opts.ghToken = 'NOT-EXISTING-ENV-KEY'
  delete opts.tag
  t.rejects(() => cmd(opts), new Error('.ghToken should NOT be shorter than 40 characters'))
})

test('npm ping failed', t => {
  t.plan(1)
  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    npm: { ping: { code: 1 } },
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 1 } } }) }
  })
  const opts = buildOptions()
  opts.semver = 'minor'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag
  t.rejects(() => cmd(opts), new Error('npm ping returned code 1 and signal undefined'))
})

test('publish a module never released', async t => {
  t.plan(3)
  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    npm: {
      ping: { code: 0, data: 'Ping success: {}' },
      config: { code: 0, data: 'my-registry' },
      whoami: { code: 0, data: 'John Doo' },
      show: { code: 1 } // npm return 404
    },
    github: {
      release: {
        inputChecker (releaseParams) {
          t.equals(releaseParams.tag_name, 'v11.15.0')
          t.equals(releaseParams.name, releaseParams.tag_name)
        }
      }
    },
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 1 } } }) }
  })
  const opts = buildOptions()
  opts.semver = 'minor'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag

  const out = await cmd(opts)
  t.strictDeepEqual(out, {
    lines: 1,
    message: '📚 PR:\n- this is a standard comment (#123)\n',
    name: 'fake-project',
    oldVersion: '11.14.42',
    release: 'minor',
    version: '11.15.0'
  })
})

test('try to publish a module version already released', t => {
  t.plan(1)
  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    npm: {
      ping: { code: 0, data: 'Ping success: {}' },
      config: { code: 0, data: 'my-registry' },
      whoami: { code: 0, data: 'John Doo' },
      show: { code: 0, data: '11.15.0' }
    },
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 1 } } }) }
  })
  const opts = buildOptions()
  opts.semver = 'minor'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag
  t.rejects(() => cmd(opts), new Error('The module fake-project@11.15.0 is already published in the registry my-registry'))
})

test('fails to push the release', t => {
  t.plan(1)

  const opts = buildOptions()
  opts.semver = 'patch'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag

  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    npm: { ping: { code: 0, data: 'Ping success: {}' } },
    git: { commit: { throwError: true } },
    github: { release: { throwError: true } },
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 1 } } }) }
  })

  t.rejects(() => cmd(opts), new Error("Something went wrong pushing the package.json to git.\nThe 'npm publish' has been done! Check your 'git status' and if necessary run 'npm unpublish fake-project@11.14.43'.\nConsider creating a release on GitHub by yourself with this message:\n📚 PR:\n- this is a standard comment (#123)\n"))
})

test('fails to build the release', t => {
  t.plan(1)

  const opts = buildOptions()
  opts.semver = 'patch'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag

  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    npm: { ping: { code: 0, data: 'Ping success: {}' } },
    github: { release: { throwError: true } },
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 1 } } }) }
  })

  t.rejects(() => cmd(opts), new Error("Something went wrong creating the relase on GitHub.\nThe 'npm publish' and 'git push' has been done!\nConsider creating a release on GitHub by yourself with this message:\n📚 PR:\n- this is a standard comment (#123)\n"))
})

test('try to publish a module major', t => {
  t.plan(1)
  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 1 } } }) }
  })
  const opts = buildOptions()
  opts.semver = 'major'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag
  t.rejects(() => cmd(opts), new Error('You can not release a major version without --major flag'))
})

test('publish a module major', async t => {
  t.plan(2)

  const opts = buildOptions()
  opts.semver = 'major'
  opts.ghToken = '0000000000000000000000000000000000000000'
  opts.major = true
  opts.npmAccess = 'public'
  opts.npmDistTag = 'next'
  opts.npmOtp = '123789'
  delete opts.tag

  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    npm: {
      ping: { code: 0, data: 'Ping success: {}' },
      config: { code: 0, data: 'my-registry' },
      whoami: { code: 0, data: 'John Doo' },
      publish: { code: 0,
        inputChecker (publishArgs) {
          t.strictDeepEqual(publishArgs, [ '--tag', opts.npmDistTag, '--access', opts.npmAccess, '--otp', opts.npmOtp ])
        }
      }
    },
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 3 } } }) }
  })

  const out = await cmd(opts)
  t.strictDeepEqual(out, {
    lines: 3,
    message: '📚 PR:\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n',
    name: 'fake-project',
    oldVersion: '11.14.42',
    release: 'major',
    version: '12.0.0'
  })
})

test('publish a module minor with no-verify', async t => {
  t.plan(1)

  const opts = buildOptions()
  opts.semver = 'minor'
  opts.ghToken = '0000000000000000000000000000000000000000'
  opts.npmAccess = 'public'
  opts.noVerify = true
  delete opts.tag

  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    npm: {
      ping: { code: 0, data: 'Ping success: {}' },
      config: { code: 0, data: 'my-registry' },
      whoami: { code: 0, data: 'John Doo' },
      publish: { code: 0 }
    },
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 2 } } }) }
  })

  const out = await cmd(opts)
  t.strictDeepEqual(out, {
    lines: 2,
    message: '📚 PR:\n- this is a standard comment (#123)\n- this is a standard comment (#123)\n',
    name: 'fake-project',
    oldVersion: '11.14.42',
    release: 'minor',
    version: '11.15.0'
  })
})

test('publish a module minor editing the release message', async t => {
  t.plan(4)

  const opts = buildOptions()
  opts.semver = 'minor'
  opts.ghToken = '0000000000000000000000000000000000000000'
  opts.ghReleaseEdit = true
  delete opts.tag

  const fakeFile = 'fake-temp'

  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    npm: {
      ping: { code: 0, data: 'Ping success: {}' },
      config: { code: 0, data: 'my-registry' },
      whoami: { code: 0, data: 'John Doo' },
      publish: { code: 0 }
    },
    external: {
      './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 2 } } }),
      '../editor': proxyquire('../lib/editor', {
        'temp-write': async (message, filename) => fakeFile,
        'open-editor': {
          make: (tmpFile) => {
            t.equals(tmpFile.pop(), fakeFile)
            return { arguments: [] }
          }
        },
        child_process: {
          spawn: () => {
            const e = new EventEmitter()
            setImmediate(() => { e.emit('exit', 0) })
            return e
          }
        },
        fs: {
          readFile (tmpFile, opts, cb) {
            t.equals(tmpFile, fakeFile)
            cb(null, 'my message')
          },
          unlink (tmpFile) { t.equals(tmpFile, fakeFile) }
        }
      })
    }
  })

  const out = await cmd(opts)
  t.strictDeepEqual(out, {
    lines: 2,
    message: 'my message',
    name: 'fake-project',
    oldVersion: '11.14.42',
    release: 'minor',
    version: '11.15.0'
  })
})

test('publish a module from a branch that is not master', async t => {
  t.plan(2)

  const opts = buildOptions()
  opts.semver = 'minor'
  opts.branch = '1.x'
  opts.ghToken = '0000000000000000000000000000000000000000'
  delete opts.tag

  const cmd = h.buildProxyCommand('../lib/commands/publish', {
    git: {
      status: { tracking: `${opts.remote}/${opts.branch}` },
      commit: { branch: opts.branch }
    },
    npm: {
      ping: { code: 0, data: 'Ping success: {}' },
      config: { code: 0, data: 'my-registry' },
      whoami: { code: 0, data: 'John Doo' }
    },
    github: {
      release: {
        inputChecker (releaseParams) {
          t.equals(releaseParams.target_commitish, opts.branch)
        }
      }
    },
    external: { './draft': h.buildProxyCommand('../lib/commands/draft', { git: { tag: { history: 1 } } }) }
  })

  const out = await cmd(opts)
  t.strictDeepEqual(out, {
    lines: 1,
    message: '📚 PR:\n- this is a standard comment (#123)\n',
    name: 'fake-project',
    oldVersion: '11.14.42',
    release: 'minor',
    version: '11.15.0'
  })
})
