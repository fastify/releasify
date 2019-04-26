'use strict'

const fs = require('fs')
const open = require('open')
const tempWrite = require('temp-write')

module.exports.editMessage = async function editMessage (message, tempFileName) {
  const fileTmp = await tempWrite(message, tempFileName)

  const openArgs = { wait: true }
  if (process.platform === 'win32') {
    // TODO editor recognition: needed beacuse wait won't work without specifing an application
    openArgs.app = 'code'
  }

  await open(fileTmp, openArgs)
  const editedMessage = fs.readFileSync(fileTmp, 'utf8')
  fs.unlink(fileTmp) // delete and forget
  return editedMessage
}
