'use strict'

const { spawn } = require('child_process')

function runSpawn (cwd, cmd, args) {
  return new Promise((resolve, reject) => {
    const cli = spawn(cmd, args, { cwd, env: process.env, shell: true })
    cli.stdout.setEncoding('utf8')

    // cli.stdout.pipe(process.stdout)
    // cli.stderr.pipe(process.stdout)

    let stdout = ''
    cli.stdout.on('data', (data) => {
      stdout += data
    })
    cli.on('close', (code, signal) => {
      if (code === 0) {
        return resolve(stdout.trim())
      }
      reject(new Error(`${cmd} ${args} returned code ${code} and signal ${signal} ${stdout || ''}`))
    })
  })
}

module.exports = function npmWrapper (cwd) {
  return {
    async ping () {
      const out = await runSpawn(cwd, 'npm', ['ping'])
      if (!out.includes('success')) {
        throw new Error(`Ping command doesn't returned success`)
      }
      return out
    },
    async whoami () {
      return runSpawn(cwd, 'npm', ['whoami'])
    },
    show (moduleLink, view) {
      return runSpawn(cwd, 'npm', ['show', moduleLink, view])
    },
    config (key) {
      return runSpawn(cwd, 'npm', ['config', 'get', key])
    },
    version (version, commitMessage = 'Bumped to v%s') {
      // https://docs.npmjs.com/cli/version.html
      // 💩 https://github.com/npm/npm/issues/17327
      return runSpawn(cwd, 'npm', ['--no-git-tag-version', 'version', version])
    },
    publish ({ tag, access }) {
      const args = ['publish']
      if (tag) {
        args.push('--tag')
        args.push(tag)
      }

      if (access) {
        args.push('--access')
        args.push(access)
      }
      return runSpawn(cwd, 'npm', args)
    }
  }
}
