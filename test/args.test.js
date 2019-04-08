'use strict'

const t = require('tap')
const { test } = t
const parseArgs = require('../lib/args')

test('parse all args', t => {
  t.plan(1)

  const argv = [
    '--help', 'true',
    '--path', 'a/path',
    '--tag', 'vPattern',
    '--verbose', 'info',
    '--semver', 'major'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: true,
    path: 'a/path',
    tag: 'vPattern',
    verbose: 'info',
    semver: 'major'
  })
})

test('check default values', t => {
  t.plan(1)
  const parsedArgs = parseArgs([])

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: false,
    path: process.cwd(),
    tag: undefined,
    verbose: 'error',
    semver: undefined
  })
})

test('parse args with = assignment', t => {
  t.plan(1)

  const argv = [
    '--help=false',
    '--path="a/path with space"',
    '--tag=vPattern',
    '--verbose=info',
    '--semver=major'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: false,
    path: 'a/path with space',
    tag: 'vPattern',
    verbose: 'info',
    semver: 'major'
  })
})

test('parse args aliases', t => {
  t.plan(1)

  const argv = [
    '-h',
    '-p', 'a/path',
    '-t', 'vPattern',
    '-v', 'info',
    '-s', 'major'
  ]
  const parsedArgs = parseArgs(argv)

  t.strictDeepEqual(parsedArgs, {
    _: [],
    help: true,
    path: 'a/path',
    tag: 'vPattern',
    verbose: 'info',
    semver: 'major'
  })
})
