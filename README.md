# releasify

![CI](https://github.com/fastify/releasify/workflows/CI/badge.svg)
[![NPM version](https://img.shields.io/npm/v/releasify.svg?style=flat)](https://www.npmjs.com/package/releasify)
[![NPM downloads](https://img.shields.io/npm/dm/releasify.svg?style=flat)](https://www.npmjs.com/package/releasify)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![codecov](https://codecov.io/gh/fastify/releasify/branch/master/graph/badge.svg)](https://codecov.io/gh/fastify/releasify)
[![Known Vulnerabilities](https://snyk.io/test/github/fastify/releasify/badge.svg)](https://snyk.io/test/github/fastify/releasify)

A CLI tool to simplify your release process!

**Important note**:
This tool simplifies your release process, if you don't have one, it is the right time to start adopting one!

## The Release Process with `releasify`

This is what you can achieve with `releasify`:

  1. You want to release your `awesome-module`
  2. Go to the local directory and checkout the branch you want to release
  3. Execute `releasify publish` (see the [examples](#Publish)).
  
At this point, the tool will perform the following actions for you:

  * It checks that your local repo is aligned with your git remote
  * It updates the version of your `package.json` (version bump)
  * It publishes the module in the `npm` registry using your default settings
  * It commits & pushes the bumped version to your remote
  * It creates a GitHub release with a CHANGELOG description also creating a tag with the same version as per your `package.json`

A new version of your module is now published! 🎉

## Install

```sh
// global install
npm i releasify -g

// npx usage
npx releasify <command>

// show man of a command
npx releasify <command> --help

// check the version installed
releasify -v
```

**Note:** You need Node.js >= 10 to use this CLI.

## Commands

Check the [man](man/) directory to see all the arguments detail or type `npx releasify help` 
to get a preview.

### ☄ Publish

You need a [GitHub OAUTH Token][gh-token] with scope `repo:public_repo` to run this command.

```sh
releasify publish [--path|-p <path>]             ➡ The path to the project to release. Default `pwd`
                  [--tag|-t <pattern>]           ➡ The pattern of the tag to release. Useful for multi-branch project. It is necessary to find the last tag released of that pipeline. Default `v${major version of the project}.\d+.\d+`
                  [--semver|-s <release>]        ➡ Force the release type. The value must be [major, premajor, minor, preminor, patch, prepatch, prerelease]
                  [--verbose|-v <level>]         ➡ Print out more info. The value must be [trace, debug, info, warn, error]. Default `warn`
                  [--remote|-r <string>]         ➡ The remote git where push the bumped version. Useful if you are releasing. Default `origin`
                  [--branch|-b <string>]         ➡ The branch you want to release. Useful when you need to release a multi-branch module. Default `master`
                  [--no-verify|-n]               ➡ Add the `--no-verify` to the commit, useful for slow test you don't need to run in case of bump
                  [--gh-token|-k <env | token>]  ➡ The GitHub OAUTH token. You can set it with an env var name or a valid token. Default env var `GITHUB_OAUTH_TOKEN`
                  [--gh-release-edit|-e]         ➡ Open an editor to modify the release message before creating it on GitHub
                  [--gh-release-draft]           ➡ Create the GitHub Release as draft. Default `false`
                  [--gh-release-prerelease]      ➡ Create the GitHub Release as pre-release. Default `false`
                  [--gh-group-by-label|-l <label>] ➡ Group the commits in the changelog message by PR's labels
                  [--npm-access|-a <string>]       ➡ It will set the --access flag of `npm publish` command. Useful for scoped modules. The value must be [public, restricted]
                  [--npm-dist-tag <string>]        ➡ It will add a npm tag to the module, like `beta` or `next`
                  [--npm-otp <code>]               ➡ It will provide the otp code to the npm publish
                  [--major|-m]                     ➡ It will unlock the release of a major release
                  [--help|-h]                      ➡ Show this help message
```

#### Examples

The following example shows how to release a minor version of `your-module` to NPM (using 2FA authentication) with a custom GitHub release message:

```sh
export MY_ENV_OAUTH_KEY 0000000000000000000000000000000000000000
cd /your-module
releasify publish -v debug -s minor -k MY_ENV_OAUTH_KEY -e --npm-otp 123456
```
---

This example releases a patch version of `mod` in the branch `1.x`. Here 2FA auth is disabled on NPM and the GitHub OAUTH token in stored as an environment variable as `GITHUB_OAUTH_TOKEN`:


```sh
releasify publish -p ./mod -b 1.x -t v1.* -v debug -s patch
```

Explanation:
+ `-b`: it will check that your local repository is in the right branch and it will be used in the bump phase
+ `-t`: it will be used to explore the git history to find the commit messages. This is necessary when your tag name pattern doesn't follow the `v<semver-version>` pattern. By default the value of this parameter is `v${major version read from package.json}*`

---

The following example release a major version of `your-module` to NPM with a grouped GitHub release message.
If a PR has many matching labels, it will be assigned to the first label in the command line.
If a PR doesn't have any match with the label in the args, it will append at the end of the message.

```sh
cd /your-module
releasify publish -v debug -m -s major -l feature -l bugfix -l documentation

# example message:
**feature**:
- four this is feature (#4)


**bugfix**:
- two this is a bugfix (#2)
- three this is a doc bugfix (#3)


**commit**:
- five this is a typescript pr (#5)
```

### ☄ Draft

Print out the new version that should be released with its changelog listing the commit messages.

The commits shown are
+ from: the `HEAD` of your local project 
+ to: the _first commit_ or the _last version tag_ you created

Moreover, if the commit message is written with the pattern: `text describing (#123)`, where
`(#123)` is the pull request ID, the labels of that PR are downloaded and processed by the template
engine. These info are fetched from GitHub, keep in mind that there are [rate limits](https://developer.github.com/v3/#rate-limiting).

```sh
releasify draft [--path|-p <path>]        ➡ The path to the project to draft. Default `pwd`
                [--tag|-t <pattern>]      ➡ The pattern of the tag to draft. Useful for multi-branch project. Default `v${major version of the project}.\d+.\d+`
                [--from-commit <hash>]    ➡ Specify a commit hash where to start to generate the release message. Default `HEAD`
                [--to-commit <hash>]      ➡ Specify a commit hash where to stop to generate the release message. The --tag arg will be ignored
                [--semver|-s <release>]   ➡ Force the release type. The value must be [major, premajor, minor, preminor, patch, prepatch, prerelease]
                [--verbose|-v <level>]    ➡ Print out more info. The value must be [trace, debug, info, warn, error]
                [--gh-group-by-label|-l <label>] ➡ Group the commits in the changelog message by PR's labels
                [--help|-h]               ➡ Show this help message
```

#### Examples

View the release message for your next release:

```sh
releasify draft
```
---

Build release messages between old commits in order to create a changelog if you don't have one:

```sh
releasify draft --from-commit 93c914beb07eede9635d1234c20cff0e41f093a1 --to-commit 8797fc32812fb988957145877429aa937af292f1
```


### ⚙ Config

Save your default settings to speed up even more your release!
Whan you run this command a prompt will ask you the value to store for the `arg` setting.
The values are saved in an encrypted file, so it is human-unreadable.

```sh
releasify config [--arg <string>]          ➡ The argument to save
                 [--verbose|-v <level>]    ➡ Print out more info. The value must be [trace, debug, info, warn, error]
                 [--help|-h]               ➡ Show this help message
```

#### Examples

Save your github token (then digit it in the prompt):

```sh
releasify config --arg gh-token
```
---

Save the default logging and print out where the store file is saved:

```sh
releasify config --arg verbose -v info
```

## License

Licensed under [MIT](./LICENSE).

[gh-token]: https://help.github.com/articles/creating-an-access-token-for-command-line-use
