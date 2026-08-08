'use strict'

const { spawn } = require('node:child_process')

function runSpawn (cwd, cmd, args, { echo = false } = {}) {
  return new Promise((resolve, reject) => {
    // browser/WebAuthn auth needs a real TTY to poll for confirmation:
    // inherit stdio so npm sees the actual terminal instead of a pipe
    const stdio = echo ? 'inherit' : undefined
    const cli = spawn(cmd, args, { cwd, env: process.env, shell: true, stdio })

    let stdout = ''
    let stderr = ''

    // with stdio: 'inherit', cli.stdout/stderr are null (output goes
    // straight to the terminal), so only attach listeners when piped
    if (!echo) {
      cli.stdout.setEncoding('utf8')
      cli.stderr.setEncoding('utf8')
      cli.stdout.on('data', (data) => { stdout += data })
      cli.stderr.on('data', (data) => { stderr += data })
    }

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
    publish ({ tag, access, otp, browserAuth }) {
      const args = ['publish']
      if (tag) {
        args.push('--tag')
        args.push(tag)
      }

      if (access) {
        args.push('--access')
        args.push(access)
      }

      if (browserAuth) {
        // delegates 2FA to npm's native web-based flow (Passkeys / hardware
        // security keys / WebAuthn), which opens a URL the user confirms
        // in the browser instead of typing a 6-digit OTP
        args.push('--auth-type=web')
      } else if (otp) {
        args.push('--otp')
        args.push(otp)
      }

      // in browser-auth mode npm prints the confirmation URL on stdout and
      // blocks waiting for the user: that output must be streamed live
      return runSpawn(cwd, 'npm', args, { echo: !!browserAuth })
    }
  }
}
