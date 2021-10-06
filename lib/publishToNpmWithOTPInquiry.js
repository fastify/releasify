const inquirer = require('inquirer')
const Npm = require('./npm')
const createLogger = require('./createLogger')

/**
 * @param  {object} args
 * @param  {string} moduleLink
 */
module.exports = async function publishToNpmWithOTPInquiry (args, moduleLink) {
  const npm = Npm(args.path)
  const logger = createLogger(args)

  try {
    await npm.publish({ tag: args.npmDistTag, access: args.npmAccess, otp: args.npmOtp })
  } catch (err) {
    if (err.message.includes('npm ERR! code EOTP') && !args.silent) {
      if (args.npmOtp) {
        logger.error(`OTP code "${args.npmOtp}" is not valid`)
      }
      const { inputtedOtp } = await inquirer.prompt({
        type: 'number',
        name: 'inputtedOtp',
        message: `OTP code is required to publish ${moduleLink} to NPM:`,
        validate: (v) => {
          Number.isInteger(v)
        }
      })
      console.log('~ inputtedOtp', inputtedOtp)

      await npm.publish({ tag: args.npmDistTag, access: args.npmAccess, otp: inputtedOtp })
    } else {
      throw err
    }
  }
  logger.info('Published new module version %s', moduleLink)
}
