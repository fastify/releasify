'use strict'

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

function wait (ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

function readFileHelp (file) {
  const help = fs.readFileSync(path.join('./man', file), 'utf8')
  return `${help}\n` // added because shell add a new line at the end
}

function execute (command, params = []) {
  const node = process.execPath
  return spawn(node, ['lib/cli', command, ...params])
}

module.exports = {
  wait,
  readFileHelp,
  execute
}
