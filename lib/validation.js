'use strict'

const Ajv = require('ajv')

module.exports.validate = function validate (toValidate, schema) {
  const ajv = new Ajv({ allErrors: true })
  const validate = ajv.compile(schema)
  const valid = validate(toValidate)
  if (!valid) {
    let text = ''
    const separator = ', '
    for (const err of validate.errors) {
      text += `${err.instancePath.replace(/^\//, '.')} ${err.message}${separator}`
    }
    throw new Error(text.slice(0, -separator.length))
  }
  return valid
}
