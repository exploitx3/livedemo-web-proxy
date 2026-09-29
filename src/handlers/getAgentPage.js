const ResponseCodes = require('../constants/ResponseCodes')
const ScreenTypes = require('../constants/ScreenTypes')
const ENV = require('../envServer')

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

const HEADERS = {
  'Origin-Agent-Cluster': '?0',
  'Access-Control-Max-Age': 600,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'ClientId,Authorization,Content-Type,Accept',
  'Access-Control-Allow-Credentials': true,
}

function screenThumbnail(screen) {
  if (!screen) return ''
  if (screen.type === ScreenTypes.SCREEN_VIDEO) {
    const id = screen.asset && screen.asset.playback_ids && screen.asset.playback_ids[0] && screen.asset.playback_ids[0].id
    return id ? `https://image.mux.com/${id}/thumbnail.png` : ''
  }
  return screen.imageUrl || ''
}

// Share-card <head> tags for a published agent (X player card + OG + oEmbed).
// og:url/canonical must be the app page: LinkedIn re-scrapes og:url and links the card to it.
// Demo screenshot first: LinkedIn doesn't render .webp (the stock avatars are .webp).
function buildAgentHead(agent, firstScreen, pageUrl) {
  const id = String(agent._id)
  const playerUrl = `${ENV.STORIES_API}/agents/${id}/player`
  const oEmbedTarget = `${ENV.STORIES_API}/agents/${id}`
  const avatar = agent.avatarUrl && !/\.webp(\?|$)/i.test(agent.avatarUrl) ? agent.avatarUrl : ''
  const shot = screenThumbnail(firstScreen)
  const image = shot || avatar || 'https://livedemo-cdn.s3.amazonaws.com/static/logo-round.png'
  const imageSize = shot && firstScreen.width && firstScreen.height
    ? `\n    <meta property="og:image:width" content="${firstScreen.width}"/>\n    <meta property="og:image:height" content="${firstScreen.height}"/>`
    : ''

  const title = escapeHtml(agent.name || 'AI Demo Agent')
  const description = escapeHtml(`Chat with ${agent.name || 'our AI guide'} and explore the product in an interactive demo. Built with LiveDemo.`)
  const safeImage = escapeHtml(image)

  return `
    <link rel="shortcut icon" type="image/png" href="https://livedemo-cdn.s3.amazonaws.com/static/logo-round.png"/>
    <link rel="canonical" href="${escapeHtml(pageUrl)}"/>
    <link rel="alternate" type="application/json+oembed"
          href="${ENV.STORIES_API}/oembed?url=${encodeURIComponent(oEmbedTarget)}"
          title="${title}"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="robots" content="index, follow, max-image-preview:large"/>
    <title>${title} | LiveDemo</title>
    <meta name="title" content="${title} | LiveDemo"/>
    <meta name="description" content="${description}"/>
    <meta property="og:locale" content="en_US"/>
    <meta property="og:site_name" content="LiveDemo"/>
    <meta property="og:type" content="website"/>
    <meta property="og:title" content="${title} | LiveDemo"/>
    <meta property="og:description" content="${description}"/>
    <meta property="og:url" content="${escapeHtml(pageUrl)}"/>
    <meta property="og:image" content="${safeImage}"/>
    <meta property="og:image:secure_url" content="${safeImage}"/>${imageSize}
    <meta property="og:image:alt" content="${title} — AI demo agent"/>
    <meta name="twitter:card" content="player"/>
    <meta name="twitter:site" content="@g_apostolov"/>
    <meta name="twitter:title" content="${title}"/>
    <meta name="twitter:description" content="${description}"/>
    <meta name="twitter:image" content="${safeImage}"/>
    <meta name="twitter:image:alt" content="${title} — AI demo agent"/>
    <meta name="twitter:player" content="${playerUrl}"/>
    <meta name="twitter:player:width" content="640"/>
    <meta name="twitter:player:height" content="400"/>`
}

function injectHead(cachedHtmlPage, headString) {
  const match = /([\w\W]+?)<head>([\w\W]+)/i.exec(cachedHtmlPage)
  if (!match) return cachedHtmlPage
  return match[1] + '<head>\n' + headString + '\n' + match[2].replace(/<title>[^<]*<\/title>/gi, '')
}

// GET /agents/:agentId — SPA shell with share-card tags. Drafts/missing agents
// get the plain SPA (no name/thumbnail leak).
const handler = async function (req, res) {
  const { Models } = req.mongo
  const cachedHtmlPage = req.appHtmlCache.html
  let html = cachedHtmlPage

  try {
    const agent = await Models.AiDemoAgent.findOne({ _id: req.params.agentId, deletedAt: null, isPublished: true }).lean()
    if (agent) {
      let firstScreen = null
      if (agent.defaultDemoId) {
        const story = await Models.Story.findOne({ _id: agent.defaultDemoId })
          .populate({ path: 'screens', select: '_id type imageUrl index asset width height', options: { sort: { index: 1 } } })
          .lean()
        firstScreen = story && story.screens && story.screens[0]
      }
      // Not req host: Cloudflare forwards app.livedemo.ai to the origin as app-proxy.livedemo.ai
      const pageUrl = `${ENV.APP_URL}/agents/${agent._id}`
      html = injectHead(cachedHtmlPage, buildAgentHead(agent, firstScreen, pageUrl))
    }
  } catch (error) {
    console.log(error)
  }

  res.set(HEADERS)
  res.status(ResponseCodes['200_OK'])
  res.send(html)
}

module.exports = handler
module.exports.buildAgentHead = buildAgentHead
module.exports.injectHead = injectHead
