'use strict'

const { spawn } = require('child_process')

function runSpawn (cwd, cmd, args) {
  return new Promise((resolve, reject) => {
    const cli = spawn(cmd, args, { cwd, env: process.env, shell: true })
    cli.stdout.setEncoding('utf8')

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
      // TODO
      // return runSpawn(cwd, 'npm', ['whoami'])
      return 'hi'
    },
    show (moduleLink) {
      return runSpawn(cwd, 'npm', ['show', moduleLink, 'version'])
    },
    version (version, commitMessage = 'Bumped to v%s') {
      return runSpawn(cwd, 'npm', ['version', version, '-n', '-m', commitMessage])
    }
  }
}
