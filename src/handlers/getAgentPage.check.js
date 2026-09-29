// Self-check for getAgentPage — run: node src/handlers/getAgentPage.check.js
// Fails if published agents lose their X/OG card tags, drafts leak them, or names aren't escaped.
const assert = require('assert')
const handler = require('./getAgentPage')

const SPA = '<!doctype html><html><head><title>LiveDemo</title><script src="/main.js"></script></head><body></body></html>'
const lean = value => ({ lean: async () => value, populate() { return this } })

async function run(agent, story = null) {
  const Models = {
    AiDemoAgent: { findOne: (q) => { assert.strictEqual(q.isPublished, true); return lean(agent) } },
    Story: { findOne: () => lean(story) },
  }
  let body = ''
  const res = { set() {}, status() {}, send(html) { body = html } }
  await handler({ mongo: { Models }, appHtmlCache: { html: SPA }, params: { agentId: 'a'.repeat(24) }, get: () => 'app-proxy.livedemo.ai' }, res)
  return body
}

;(async () => {
  const agent = { _id: 'a'.repeat(24), name: 'George "<b>"', avatarUrl: 'https://x/avatar.webp', defaultDemoId: 'd1' }

  const withDemo = await run(agent, { screens: [{ type: 'Screen_Screenshot', imageUrl: 'https://x/shot.png', width: 1600, height: 900 }] })
  assert.match(withDemo, /og:url" content="https:\/\/app\.livedemo\.ai\/agents\/a{24}"/, 'LinkedIn card links to the app page')
  assert.match(withDemo, /rel="canonical" href="https:\/\/app\.livedemo\.ai\/agents\/a{24}"/)
  assert.match(withDemo, /og:image:width" content="1600"/)
  assert.match(withDemo, /<meta name="twitter:card" content="player"\/>/)
  assert.match(withDemo, /twitter:player" content="[^"]+\/agents\/a{24}\/player"/)
  assert.match(withDemo, /og:image" content="https:\/\/x\/shot.png"/, 'demo screenshot preferred over .webp avatar')
  assert.match(withDemo, /json\+oembed"[\s\S]*?oembed\?url=[^"]*%2Fagents%2Fa{24}"/)
  assert.ok(withDemo.includes('George &quot;&lt;b&gt;&quot;'), 'name escaped')
  assert.ok(!withDemo.includes('"<b>"'), 'raw name never injected')
  assert.strictEqual((withDemo.match(/<title>/g) || []).length, 1, 'SPA <title> replaced, not duplicated')
  assert.ok(withDemo.includes('<script src="/main.js"></script>'), 'SPA head kept')

  const noDemo = await run({ ...agent, avatarUrl: 'https://x/avatar.png', defaultDemoId: null })
  assert.match(noDemo, /og:image" content="https:\/\/x\/avatar.png"/, 'falls back to avatar')

  const webpOnly = await run({ ...agent, defaultDemoId: null })
  assert.match(webpOnly, /og:image" content="[^"]+logo-round\.png"/, '.webp avatar skipped (LinkedIn cannot render it)')

  const draft = await run(null)
  assert.strictEqual(draft, SPA, 'draft/missing agent gets the plain SPA')

  console.log('getAgentPage.check OK')
})().catch((err) => { console.error(err); process.exit(1) })
