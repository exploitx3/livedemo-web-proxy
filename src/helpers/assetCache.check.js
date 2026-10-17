// Self-check for assetCache — run: node src/helpers/assetCache.check.js
// Fails if an old build's bundle stops being served from disk, or more than 5 builds are kept.
const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const createAssetCache = require('./assetCache')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const html = build => `<html><head><script type="module" src="https://app.livedemo.ai/assets/js/index-${build}.js"></script></head></html>`

;(async () => {
  const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asset-cache-'))
  const upstream = { '/assets/js/index-b1.js': 'bundle 1' }
  const cache = createAssetCache(cacheDir, async assetPath => (upstream[assetPath] ? { data: upstream[assetPath] } : null))

  await cache.setBuild(html('b1'))
  const b1File = await cache.find('/assets/js/index-b1.js')
  assert.ok(b1File, 'entry bundle cached when the build is registered')

  delete upstream['/assets/js/index-b1.js']
  await cache.save('/assets/js/lazy-c1.js', 'lazy chunk')

  for (let build = 2; build <= 5; build++) {
    await sleep(10)
    await cache.setBuild(html(`b${build}`))
  }
  assert.strictEqual(fs.readFileSync(await cache.find('/assets/js/index-b1.js'), 'utf8'), 'bundle 1', 'old bundle served after upstream deleted it')
  assert.ok(await cache.find('/assets/js/lazy-c1.js'), 'lazily saved chunk found')

  await sleep(10)
  await cache.setBuild(html('b6'))
  assert.strictEqual(fs.readdirSync(cacheDir).length, 5, 'only the last 5 builds kept')
  assert.strictEqual(await cache.find('/assets/js/index-b1.js'), null, 'oldest build pruned')

  await cache.save('/assets/js/index-b6.js', null)
  assert.strictEqual(await cache.find('/assets/js/index-b6.js'), null, 'missing upstream asset is not cached')

  fs.rmSync(cacheDir, { recursive: true, force: true })
  console.log('assetCache.check OK')
})().catch((err) => { console.error(err); process.exit(1) })
