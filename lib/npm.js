'use strict'

const { spawn } = require('node:child_process')

function runSpawn (cwd, cmd, args) {
  return new Promise((resolve, reject) => {
    const cli = spawn(cmd, args, { cwd, env: process.env, shell: true })
    cli.stdout.setEncoding('utf8')
    cli.stderr.setEncoding('utf8')

    let stdout = ''
    let stderr = ''
    cli.stdout.on('data', (data) => { stdout += data })
    cli.stderr.on('data', (data) => { stderr += data })
    cli.on('close', (code, signal) => {
      if (code === 0) {
        return resolve(stdout.trim())
      }
      reject(new Error(`${cmd} ${args} returned code ${code} and signal ${signal}\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`))
    })
  })
}

module.exports = function npmWrapper (cwd) {
  return {
    ping () {
      return runSpawn(cwd, 'npm', ['ping'])
    },
    whoami () {
      return runSpawn(cwd, 'npm', ['whoami'])
    },
    show (moduleLink, view) {
      return runSpawn(cwd, 'npm', ['show', moduleLink, view])
    },
    config (key) {
      return runSpawn(cwd, 'npm', ['config', 'get', key])
    },
    version (version) {
      // https://docs.npmjs.com/cli/version.html
      // 💩 https://github.com/npm/npm/issues/17327
      return runSpawn(cwd, 'npm', ['--no-git-tag-version', '--allow-same-version', 'version', version])
    },
    publish ({ tag, access, otp }) {
      const args = ['publish']
      if (tag) {
        args.push('--tag')
        args.push(tag)
      }

      if (access) {
        args.push('--access')
        args.push(access)
      }

      if (otp) {
        args.push('--otp')
        args.push(otp)
      }

      return runSpawn(cwd, 'npm', args)
    }
  }
}
