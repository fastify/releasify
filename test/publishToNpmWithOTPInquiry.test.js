
'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')

test('publishToNpmWithOTPInquiry', (t) => {
  const publish = proxyquire('../lib/publishToNpmWithOTPInquiry', {
    './npm': () => {
      return {
        publish: (publishArgs) => {
          if (!publishArgs.otp || publishArgs.otp === 'wrong OTP') {
            throw new Error('npm ERR! code EOTP')
          }
        }
      }
    },
    inquirer: {
      prompt: async (promptConfig) => {
        promptConfig.validate(123456)

        return { inputtedOtp: '123456' }
      }
    }
  })
  test('publishes', async (t) => {
    await publish({ path: process.cwd(), verbose: 'info', npmDistTag: '0.0.2', npmOtp: '111111' }, 'my-module@0.0.1')
    t.end()
  })

  test('asks for OTP and retries publishes', async (t) => {
    await publish({ path: process.cwd(), verbose: 'info', npmDistTag: '0.0.3', silent: false, npmOtp: 'wrong OTP' }, 'my-module@0.0.1')
    await publish({ path: process.cwd(), verbose: 'info', npmDistTag: '0.0.3', silent: false }, 'my-module@0.0.1')

    t.end()
  })

  test('throws other errors than OTP', async (t) => {
    const randomError = 'any random error'

    const publish = proxyquire('../lib/publishToNpmWithOTPInquiry', {
      './npm': () => {
        return {
          publish: () => {
            throw new Error(randomError)
          }
        }
      }
    })
    try {
      await publish({ path: process.cwd(), verbose: 'info', npmDistTag: '0.0.3', silent: false }, 'my-module@0.0.1')
    } catch (err) {
      t.equal(err.message, randomError)
    }
    t.end()
  })
  t.end()
})
