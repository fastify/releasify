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

  await open(fileTmp, openArgs)
  const editedMessage = await readFile(fileTmp, 'utf8')
  fs.unlink(fileTmp, () => {}) // delete and forget
  return editedMessage
}
