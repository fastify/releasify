# releasify

A CLI tool to simplify your release process!

## Install

```sh
// global install
npm i releasify -g

// npx usage
npx releasify <command>

// show man of a command
npx releasify <command> --help
```

## Commands

Check the [man](man/) directory to see all the arguments detail or type `npx releasify help` 
to get a preview.

### Publish

You need a [GitHub OAUTH Token][gh-token] with scope `repo:public_repo` to run this command.

```sh
releasify publish [--path|-p <path>]
                  TODO

# examples:
releasify publish -p ./repo-tester -v debug -s patch
releasify publish -p ./repo-tester -r upstream -b 1.x -t v1.* -v debug -s patch
```

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
                [--semver|-s <relese>]
                [--verbose|-v <level>]
                [--help|-h]
```


## License

Licensed under [MIT](./LICENSE).

[gh-token][https://help.github.com/articles/creating-an-access-token-for-command-line-use]
