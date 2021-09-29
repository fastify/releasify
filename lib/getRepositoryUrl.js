module.exports = function (git) {
  const pkg = git.getRepoPackage()
  if (!pkg.repository) {
    throw new Error("package.json doesn't have a repository field")
  }
  const repositoryUrl =
    typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url
  return repositoryUrl
}
