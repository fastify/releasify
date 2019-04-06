# releasify

A CLI tool to simplify your release process!

## Install

```sh
// global install
npm i releasify -g

// npx usage
npx releasify <command>
```

## Commands

Check the [man](man/) directory to see all the arguments detail or type `npx releasify help` 
to get a preview.

### Draft

Print out the new version that should be released with its changelog based on the commit messages.

```sh
releasify draft [--path|-p <path>]
                [--tag|-t <pattern>]
                [--semver|-s <relese>]
                [--help|-h]
```


## License

Licensed under [MIT](./LICENSE).
