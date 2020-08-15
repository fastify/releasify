#!/bin/sh -l

# echo params for debug during impl
echo "Params $*"

# draft for test
releasify draft \
  --semver=${1} \
  --remote=${2} \
  --branch=${3} \
  --npm-otp=${4} \
  --npm-dist-tag=${5} \
  --major=${6}
