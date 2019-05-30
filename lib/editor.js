'use strict'

const fs = require('fs')
const { promisify } = require('util')
const open = require('open-editor')
const tempWrite = require('temp-write')
const { spawn } = require('child_process')

const readFile = promisify(fs.readFile)

module.exports.editMessage = async function editMessage (message, tempFileName) {
  const fileTmp = await tempWrite(message, tempFileName)

  await waitEditor(fileTmp)
  const editedMessage = await readFile(fileTmp, 'utf8')
  fs.unlink(fileTmp, () => {}) // delete and forget
  return editedMessage
}

function waitEditor (fileTmp) {
  return new Promise((resolve, reject) => {
    const editor = open.make([fileTmp])

    // TODO should be customized for editors
    editor.arguments.unshift('--wait')

    const subProcess = spawn(editor.binary, editor.arguments, {
      detached: true,
      stdio: editor.isTerminalEditor ? 'inherit' : 'ignore',
      shell: process.platform === 'win32'
    })

    subProcess.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Editor exit with code ${code}`))
      }
    })
    subProcess.on('error', reject)
  })
}
