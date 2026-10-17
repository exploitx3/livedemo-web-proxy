const ENV = require('./envServer')
const express = require('express')
const bodyParser = require('body-parser')

const axios = require('axios')
const path = require('path')

const createAssetCache = require('./helpers/assetCache')
const getLiveDemoPageHandler = require('./handlers/getLiveDemoPage')
const getLiveDemoWithLinkPageHandler = require('./handlers/getLiveDemoWithLinkPage')
const getAgentPageHandler = require('./handlers/getAgentPage')


const { setupDB, getModels } = require('./models')

const ResponseCodes = require('./constants/ResponseCodes')


const app = express()

let conn = null
let Models = null

async function setupMongo(req, res, next) {

  if (conn === null) {
    conn = await setupDB()

    Models = getModels(conn)
  }

  req.mongo = {
    conn: conn,
    Models: Models
  }

  next()
}


let appHtmlCache = {
  html: ''
}
let appHtmlInflight = null
let draining = false
let shuttingDown = false

const fetchAppIndexHtml = function () {
  return axios.get(ENV.SERVER_URL, {
    headers: {
      'Accept': 'text/html'
    },
    timeout: 10000
  })
    .then((res) => {

      return res.data
    })


}

// Resolves null for anything but a real asset: S3/CloudFront answer missing files with the SPA html.
const fetchAsset = function (assetPath) {
  return axios.get(ENV.SERVER_URL + assetPath, {
    responseType: 'arraybuffer',
    timeout: 30000
  })
    .then((res) => {
      const contentType = res.headers['content-type'] || ''

      return contentType.includes('text/html') ? null : { data: res.data, contentType }
    })
    .catch(() => null)
}

const assetCache = createAssetCache(process.env.APP_PROXY_CACHE_DIR || '/data/app-proxy/cache', fetchAsset)

const registerAppBuild = function (html) {
  assetCache.setBuild(html).catch(err => console.error('Failed to cache app build', err.message))
}

// One in-flight fetch shared by the warmer and request path.
function ensureAppCache() {
  if (appHtmlCache.html) {

    return Promise.resolve()
  }
  
  if (!appHtmlInflight) {
    appHtmlInflight = fetchAppIndexHtml()
      .then(htmlData => {
        if (!htmlData) throw new Error('empty app index.html')

        appHtmlCache.html = htmlData
        console.log('Cached app index.html')
        registerAppBuild(htmlData)
      })
      .catch(err => {
        appHtmlInflight = null
        console.error('Failed to cache app index.html', err.message)
        throw err
      })
  }

  return appHtmlInflight
}

// ponytail: fixed 2s retry until the first successful fetch. Readiness stays
// false until then, so a dead upstream cannot take this pod into rotation.
// Upgrade path: backoff if SERVER_URL is down for a long time.
function warmAppCache() {
  ensureAppCache().catch(() => {
    setTimeout(warmAppCache, 2000)
  })
}

warmAppCache()

async function setupCache(req, res, next) {

  if (!appHtmlCache.html) {
    await ensureAppCache()
  }

  req.appHtmlCache = appHtmlCache

  next()
}



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5000mb', extended: true }))
app.options('*', (req, res) => {
  const resultResponse = {
    statusCode: ResponseCodes['200_OK'],
    headers: {
      'Access-Control-Max-Age': 600,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': 'ClientId,Authorization,Content-Type,Accept,X-Requested-With', // Required for CORS support to work
      // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    }
  }

  res.set(resultResponse.headers)
  res.status(resultResponse.statusCode)
  res.send()
})

// Handle health check
app.get('/health', (req, res) => {
  const resultResponse = {
    statusCode: ResponseCodes['200_OK'],
    headers: {
      'Access-Control-Max-Age': 600,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'ClientId,Authorization,Content-Type,Accept', // Required for CORS support to work
      // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    }
  }

  res.set(resultResponse.headers)
  res.status(resultResponse.statusCode)
  res.send()
})

// Handle health check
app.get('/healthz', (req, res) => {
  const resultResponse = {
    statusCode: ResponseCodes['200_OK'],
    headers: {
      'Access-Control-Max-Age': 600,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'ClientId,Authorization,Content-Type,Accept', // Required for CORS support to work
      // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    }
  }

  res.set(resultResponse.headers)
  res.status(resultResponse.statusCode)
  res.send()
})

// Readiness for the rollout probe and the GCE ingress health check.
// Liveness (/healthz) stays independent: a Mongo or upstream blip must not restart the pod.
// ponytail: mongo is not required here. Most traffic is the upstream proxy, and failing
// ready on a db blip would drain every GCE backend. Page routes still connect on demand.
app.get('/readyz', (req, res) => {
  if (draining || !appHtmlCache.html) {
    res.status(503).send('not ready')
    return
  }

  res.status(200).send('ready')
})



function corsMiddleware(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}


app.get('/livedemos/:storyId([a-f0-9]{24})', [setupMongo, setupCache], getLiveDemoPageHandler)
app.get('/livedemos/:storyId([a-f0-9]{24})/links/:linkId([a-f0-9]{24})', [setupMongo, setupCache], getLiveDemoWithLinkPageHandler)
app.get('/agents/:agentId([a-f0-9]{24})', [setupMongo, setupCache], getAgentPageHandler)

// Loopback only: web-app deploy-prod.sh calls this in every pod via kubectl exec after the S3 sync.
// Ingress traffic arrives from the load balancer address, so it never matches.
app.post('/internal/refresh-app-cache', (req, res) => {
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress)) {

    res.status(404).send()
    return
  }

  fetchAppIndexHtml()
    .then(async (htmlData) => {
      if (!htmlData) throw new Error('empty app index.html')

      const changed = htmlData !== appHtmlCache.html
      appHtmlCache.html = htmlData
      await assetCache.setBuild(htmlData)
      console.log(changed ? 'Refreshed app index.html' : 'App index.html unchanged')
      res.send(changed ? 'refreshed\n' : 'unchanged\n')
    })
    .catch((err) => {
      console.error('Failed to refresh app index.html', err.message)
      res.status(502).send(err.message + '\n')
    })
})

app.get('/assets/*', (req, res, next) => {
  const assetPath = path.posix.normalize(req.path)

  if (assetPath.includes('..') || !/^\/assets\/[\w./-]+$/.test(assetPath)) {

    next()
    return
  }

  assetCache.find(assetPath)
    .then((file) => {
      res.set('Origin-Agent-Cluster', '?0')

      if (file) {

        res.sendFile(file, { maxAge: '1y', immutable: true })
        return
      }

      return fetchAsset(assetPath).then((asset) => {
        if (!asset) {

          next()
          return
        }

        assetCache.save(assetPath, asset.data).catch(err => console.error('Failed to cache asset', assetPath, err.message))
        res.set({
          'Content-Type': asset.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable'
        })
        res.send(asset.data)
      })
    })
    .catch(() => next())
})

app.use('*', function (req, res) {
  const url = ENV.SERVER_URL + req.originalUrl

  res.set('Origin-Agent-Cluster', '?0')

  axios({
    method: req.method,
    url,
    data: req,
    responseType: 'stream',
    headers: {
      ...req.headers,
      host: new URL(ENV.SERVER_URL).host
    }
  })
    .then(proxyRes => {
      res.set(proxyRes.headers)
      res.status(proxyRes.status)
      proxyRes.data.pipe(res)
    })
    .catch(err => {
      if (err.response) {
        res.set(err.response.headers)
        res.status(err.response.status)
        err.response.data.pipe(res)
      } else {
        res.status(502).send('Bad Gateway')
      }
    })
})

const http = require('http').Server(app)

function shutdown() {
  if (shuttingDown) return

  shuttingDown = true
  draining = true
  http.close(() => process.exit(0))
  // preStop already waited for the load balancer; force-exit if a connection hangs
  setTimeout(() => process.exit(0), 20000)
}

process.on('SIGTERM', shutdown)
// preStop sets this before the grace sleep, so /readyz fails and the load balancer drops the pod
// while existing requests still finish
process.on('SIGUSR2', () => {
  draining = true
})

async function setup() {

  const port = process.env.PROXY_PORT ? Number(process.env.PROXY_PORT) : 3055

  http.listen(port, () => {
    console.log('App-proxy server started on ' + http.address().port)
  })
}

setup()

