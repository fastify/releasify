'use strict'

const fs = require('fs')
const { promisify } = require('util')
const open = require('open')
const tempWrite = require('temp-write')

const readFile = promisify(fs.readFile)

module.exports.editMessage = async function editMessage (message, tempFileName) {
  const fileTmp = await tempWrite(message, tempFileName)

  const openArgs = { wait: true }
  if (process.platform === 'win32') {
    // TODO editor recognition: needed beacuse wait won't work without specifing an application
    openArgs.app = 'code'
  }

  await rageOpen(fileTmp, openArgs)
  const editedMessage = await readFile(fileTmp, 'utf8')
  fs.unlink(fileTmp, () => {}) // delete and forget
  return editedMessage
}

function rageOpen (fileTmp, openArgs) {
  let alreadyResolved = false
  return new Promise(resolve => {
    const exit = () => {
      if (!alreadyResolved) {
        alreadyResolved = true
        resolve()
      }
    }

    process.once('SIGINT', exit)
    open(fileTmp, openArgs).then(exit, exit)
  })
}
