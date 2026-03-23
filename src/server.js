const ENV = require('./envServer')
const express = require('express')
const bodyParser = require('body-parser')

const axios = require('axios')

const getLiveDemoPageHandler = require('./handlers/getLiveDemoPage')
const getLiveDemoWithLinkPageHandler = require('./handlers/getLiveDemoWithLinkPage')


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

const fetchAppIndexHtml = function() {
  return axios.get(ENV.SERVER_URL, {
      headers: {
        'Accept': 'text/html'
      }
    })
    .then((res) => {

      return res.data
    })


}


async function setupCacheInternal() {
  if (!appHtmlCache.html) {
    await fetchAppIndexHtml()
      .then(htmlData => {
        appHtmlCache.html = htmlData

        console.log('Cached app index.html')
      })
  }

}

setupCacheInternal()

async function setupCache(req, res, next) {

  if (!appHtmlCache.html) {
    await fetchAppIndexHtml()
      .then(htmlData => {
        appHtmlCache.html = htmlData

        console.log('Cached app index.html')
      })
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



function corsMiddleware(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}


app.get('/livedemos/:storyId', [setupMongo, setupCache], getLiveDemoPageHandler)
app.get('/livedemos/:storyId/links/:linkId', [setupMongo, setupCache], getLiveDemoWithLinkPageHandler)

app.use('*', function(req, res) {
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

async function setup() {

  http.listen(3055, () => {
    console.log('App-proxy server started')
  })
}

setup()

