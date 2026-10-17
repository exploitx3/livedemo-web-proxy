const fsp = require('fs/promises')
const path = require('path')
const crypto = require('crypto')

const MAX_BUILDS = 5

// Vite files under /assets are content-hashed, so a cached copy never goes stale.
// One dir per app build (index.html version) so pages still holding an older index.html
// can load their bundles after the deploy's `s3 sync --delete` removed them.
const createAssetCache = function (cacheDir, fetchAsset) {
  let currentBuildDir = null

  const listBuildDirs = function () {
    return fsp.readdir(cacheDir)
      .catch(() => [])
      .then(names => Promise.all(names.map(name => {
        const buildDir = path.join(cacheDir, name)

        return fsp.stat(path.join(buildDir, 'index.html'))
          .then(stat => ({ buildDir, mtime: stat.mtimeMs }), () => null)
      })))
      .then(builds => builds
        .filter(Boolean)
        .sort((a, b) => b.mtime - a.mtime)
        .map(build => build.buildDir))
  }

  const find = async function (assetPath) {
    for (const buildDir of await listBuildDirs()) {
      const file = path.join(buildDir, assetPath)

      if (await fsp.access(file).then(() => true, () => false)) {

        return file
      }
    }

    return null
  }

  const save = async function (assetPath, data) {
    if (!currentBuildDir || !data) {

      return
    }

    const file = path.join(currentBuildDir, assetPath)
    const tmpFile = `${file}.${process.pid}-${Date.now()}.tmp`

    await fsp.mkdir(path.dirname(file), { recursive: true })
    await fsp.writeFile(tmpFile, data)
    await fsp.rename(tmpFile, file)
  }

  const setBuild = async function (html) {
    const assetPaths = [...new Set(html.match(/\/assets\/[\w./-]+/g) || [])]
    const buildId = crypto.createHash('sha1').update(assetPaths.join('\n')).digest('hex').slice(0, 12)

    currentBuildDir = path.join(cacheDir, buildId)
    await fsp.mkdir(currentBuildDir, { recursive: true })
    await fsp.writeFile(path.join(currentBuildDir, 'index.html'), html)

    const staleBuildDirs = (await listBuildDirs()).slice(MAX_BUILDS)
    await Promise.all(staleBuildDirs.map(dir => fsp.rm(dir, { recursive: true, force: true })))

    // ponytail: only entry files linked from index.html are cached up front. Lazy chunks are
    // cached the first time anyone loads them through the proxy. Upgrade path: parse the
    // entry bundle for its chunk imports.
    for (const assetPath of assetPaths) {
      if (!(await find(assetPath))) {
        const asset = await fetchAsset(assetPath)
        await save(assetPath, asset && asset.data)
      }
    }
  }

  return {
    find,
    save,
    setBuild
  }
}

module.exports = createAssetCache
