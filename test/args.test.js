'use strict'

const t = require('tap')
const { test } = t
const parseArgs = require('../lib/args')

test('parse all args', t => {
  t.plan(1)

  const argv = [
    '--help', 'true'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: true
  })
})

test('check default values', t => {
  t.plan(1)
  const parsedArgs = parseArgs([])

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: false
  })
})

test('parse args with = assignment', t => {
  t.plan(1)

  const argv = [
    '--help=false'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: false
  })
})

test('parse args aliases', t => {
  t.plan(1)

  const argv = [
    '-h'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: true
  })
})
