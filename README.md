# releasify

A CLI tool to simplify your release process!

**Important note**:
This tool simplify a process, if you don't have one, it is the right time to adopt one!

## The Release Process with `releasify`

This is what you can archive with this tool to release your module:

1. You want to release your `awesome-module`
1. Go to the local directory an checkout the branch you want to release
1. Execute `releasify publish` (see the [examples](#Publish)) and the tool will:
  1. checks that your local repo is aligned with your git remote
  1. updates the version of your `package.json`
  1. publishes the module in your `npm` registry using your default settings
  1. commit&push the bumped version to your remote
  1. creates a GitHub release with a CHANGELOG description and appling a tag with the same version of the `package.json`
1. A new version of your module is now published! 🎉

## Install

```sh
// global install
npm i releasify -g

// npx usage
npx releasify <command>

// show man of a command
npx releasify <command> --help
```

**Note:** You need Node.js >= 10 to use this CLI.

## Commands

Check the [man](man/) directory to see all the arguments detail or type `npx releasify help` 
to get a preview.

### Publish

You need a [GitHub OAUTH Token][gh-token] with scope `repo:public_repo` to run this command.

```sh
releasify publish [--path|-p <path>]
                  [--tag|-t <pattern>]
                  [--semver|-s <release>]
                  [--verbose|-v <level>]
                  [--remote|-r <string>]
                  [--branch|-b <string>]
                  [--no-verify|-n]
                  [--gh-token|-k <env name var | token>]
                  [--gh-release-edit|-e]
                  [--gh-release-draft]
                  [--gh-release-prerelease]
                  [--npm-access|-a <string>]
                  [--npm-dist-tag <string>]
                  [--npm-otp <code>]
                  [--major|-m]
                  [--help|-h]
```

#### Examples

Release minor of "your-module" with 2FA on npm and customizing the GitHub release message:

```sh
export MY_ENV_OAUTH_KEY 0000000000000000000000000000000000000000
cd /your-module
releasify publish -v debug -s minor -k MY_ENV_OAUTH_KEY -e --npm-otp 123456
```
---

Release a patch of your "mod" in the branch `1.x`, assuming disabled 2FA on npm and the OAUTH token in env as `GITHUB_OAUTH_TOKEN`


```sh
releasify publish -p ./mod -b 1.x -t v1.* -v debug -s patch
```

Explanation:
+ `-b`: it will check that your local repository is in the right branch and it will be used in the bump phase
+ `-t`: it will be used to explore the git history to find the commit messages. This is necessary when your tag name pattern doesn't follow the `v<semver-version>` pattern. By default the value of this parameter is `v${major version read from package.json}*`


### Draft

Print out the new version that should be released with its changelog listing the commit messages.

The commits shown are
+ from: the `HEAD` of your local project 
+ to: the _first commit_ or the _last version tag_ you created

Moreover, if the commit message is written with the pattern: `text describing (#123)`, where
`(#123)` is the pull request ID, the labels of that PR are downloaded and processed by the template
engine. These info are fetched from GitHub, keep in mind that there are [rate limits](https://developer.github.com/v3/#rate-limiting).

```sh
releasify draft [--path|-p <path>]
                [--tag|-t <pattern>]
                [--semver|-s <release>]
                [--verbose|-v <level>]
                [--help|-h]
```


## License

Licensed under [MIT](./LICENSE).

[gh-token]: https://help.github.com/articles/creating-an-access-token-for-command-line-use
