import { getRepositoryInfo } from "electron-builder/out/util/repositoryInfo"

function checkInfo(info: any) {
  delete info.pathmatch
  delete info.pathtemplate
  delete info.httpstemplate
  delete info.filetemplate
  delete info.docstemplate
  delete info.opts
  expect(info).toMatchSnapshot()
}

test("repo slug from TRAVIS_REPO_SLUG", async () => {
  const oldValue = process.env.TRAVIS_REPO_SLUG
  try {
    process.env.TRAVIS_REPO_SLUG = "travis-ci/travis-build"
    const info: any = await getRepositoryInfo(process.cwd())
    checkInfo(info)
  }
  finally {
    if (oldValue != null) {
      restoreEnv("TRAVIS_REPO_SLUG", oldValue)
    }
  }
})

test("repo slug from APPVEYOR", async () => {
  const oldAppveyorAccountName = process.env.APPVEYOR_ACCOUNT_NAME
  const oldAppveyorProjectName = process.env.APPVEYOR_PROJECT_NAME
  const travisSlug = process.env.TRAVIS_REPO_SLUG
  try {
    if (travisSlug != null) {
      delete process.env.TRAVIS_REPO_SLUG
    }

    process.env.APPVEYOR_ACCOUNT_NAME = "travis-ci"
    process.env.APPVEYOR_PROJECT_NAME = "travis-build"
    const info = await getRepositoryInfo(process.cwd())
    checkInfo(info)
  }
  finally {
    restoreEnv("APPVEYOR_ACCOUNT_NAME", oldAppveyorAccountName)
    restoreEnv("APPVEYOR_PROJECT_NAME", oldAppveyorProjectName)
    if (travisSlug != null) {
      process.env.TRAVIS_REPO_SLUG = travisSlug
    }
  }
})

function restoreEnv(name: string, value: string | undefined) {
  if (value != null) {
    // otherwise will be set to string value "undefined"
    process.env[name] = value
  }
}