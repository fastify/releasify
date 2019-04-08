'use strict'

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const proxyquire = require('proxyquire')

function wait (ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

function readFileHelp (file) {
  const help = fs.readFileSync(path.join('./man', file), 'utf8')
  return `${help}\n` // added because shell add a new line at the end
}

function execute (command, params = []) {
  const node = process.execPath
  return spawn(node, ['lib/cli', command, ...params])
}

function buildProxyCommand (commandPath, opts = {}) {
  const { githubThrow, emptyTag } = opts
  return proxyquire(commandPath, {
    '../git-directory': proxyquire('../lib/git-directory', {
      'simple-git': function (path) {
        return {
          tag: function (commands, cb) {
            const history = `dbcf234f456e00e262103c55cf2ce44f64fc1b7e
55acd4af74a5e74cdf91f5cbc207c86a8b9fdcac
797d63bbd491e20536d6cae8867c5210db75318e
dcf63111cd7b062b1b935d9c4925f70c9e08fd05
10cd7a46bd0ed5b6a4fbc54a7320c5bb76966c9e
20e8b1bcbe6a28954a01a5a58de9cb9f9d616420
1606f37011c58b556d07c2539203b95f895838f6
946d9f84afb202e49c89d8511be14e9bf4740a1b
b4560139a74d5a40c58d30d1bd7dd2dc21a1b153
c037c5d6e3a601d0f2c66a31e09bb06fe7c123d2
a9a2ba10618d9714d9d0d47d7aef4d779f57224f
            `
            cb(null, emptyTag === true ? '' : history)
          },
          log: function (params, cb) {
            const commits = {
              all: [ {
                hash: '68241662e2328127cf571d46194b63da20ea55bc',
                date: '2019-04-08 01:46:25 +0430',
                message: 'TOC added to Reply.md (#1582)',
                refs: 'HEAD -> master, origin/master, origin/HEAD',
                body: '',
                author_name: 'srmarjani',
                author_email: 'razi.marjani@gmail.com' },
              {
                hash: 'b23a2a3923e6b644e910c89d4cabd1536c81922d',
                date: '2019-04-07 20:10:01 +0800',
                message: 'Update Routes.md (#1579)',
                refs: '',
                body: 'fix link',
                author_name: 'Zoron',
                author_email: 'zoronlivingston@gmail.com' },
              {
                hash: 'a41fb18899e41f40ca1d8e7cb9ace71fa04e373f',
                date: '2019-04-06 19:27:39 +0200',
                message: 'Update Ecosystem.md (#1570)',
                refs: '',
                body: '',
                author_name: 'Giacomo Gregoletto',
                author_email: 'greguz@users.noreply.github.com' },
              {
                hash: '60f51bf376a08bc728f1c8b21ac44446104f1d2a',
                date: '2019-04-06 15:45:43 +0200',
                message: 'doc add fastify-schema-constraint to ecosystem (#1573)',
                refs: '',
                body: '',
                author_name: 'Manuel Spigolon',
                author_email: 'behemoth89@gmail.com' },
              {
                hash: '8f2a65ae63670e3f5b2219361bc037f006e6c6eb',
                date: '2019-04-06 15:43:29 +0200',
                message: 'This is a commit without PR',
                refs: '',
                body: '',
                author_name: 'Tommaso Allevi',
                author_email: 'tomallevi@gmail.com' } ]
            }

            cb(null, commits)
          }
        }
      }
    }),
    '../github': proxyquire('../lib/github', {
      '@octokit/rest': function () {
        return {
          issues: {
            listLabelsOnIssue: async function (options) {
              if (githubThrow === true) {
                throw new Error('HttpError - Fake limit reached')
              }
              return {
                status: 200,
                url: `https://api.github.com/repos/${options.owner}/${options.repo}/issues/${options.number}/labels`,
                headers: {
                  server: 'Test.com',
                  status: '200OK'
                },
                data: [{ name: 'documentation' }],
                pullRequest: {
                  id: options.number
                }
              }
            }
          }
        }
      }
    })
  })
}

module.exports = {
  wait,
  readFileHelp,
  execute,
  buildProxyCommand
}
