const helpers = require('../helpers/livedemoHelpers')
const fsp = require('fs/promises')
const ResponseCodes = require('../constants/ResponseCodes')
const ScreenTypes = require('../constants/ScreenTypes')
const ENV = require('../envServer')
const axios = require('axios')
// const sanitizeHtml = require('sanitize-html')



const handler = function (req, res) {
  let { Models, conn } = req.mongo

  let cachedHtmlPage = req.appHtmlCache.html

  let storyId = req.params.storyId



  return Promise.resolve()
    .then(async () => {


      return Models.Story.findOne({
          _id: storyId
        })
        .populate({
          path: 'screens',
          populate: [
            {
              path: 'customTransitions.gotoScreen',
              model: 'Screen',
              select: '_id name'
            },
            {
              path: 'steps.view.popup.formId',
              model: 'Form',
            },
          ],
          select: '_id name steps customTransitions width height imageUrl index imageUrl asset playbackRate popups zoomSpans',
          options: { sort: { 'index': 1 } }
        })
        .lean()
    })
    .then(async (storyDoc) => {
      let firstScreen = storyDoc.screens && storyDoc.screens.length && storyDoc.screens[0]

      let thumbnailImage = firstScreen.type === ScreenTypes.SCREEN_VIDEO ? `https://image.mux.com/${firstScreen.asset.playback_ids[0].id}/thumbnail.png` : firstScreen.imageUrl

      let headString = '\n<link rel="shortcut icon" type="image/png" href="https://livedemo-cdn.s3.amazonaws.com/static/logo-round.png"/>\n' +
        '    <link rel="apple-touch-icon" href="https://livedemo-cdn.s3.amazonaws.com/static/logo-round.png"/>\n' +
        '    <meta name="msapplication-TileImage" content="https://livedemo-cdn.s3.amazonaws.com/static/logo-round.png"/>\n' +
        '    <link rel="alternate" type="application/json+oembed"\n' +
        `          href="${ENV.STORIES_API}/oembed?url=${ENV.STORIES_API}/workspaces/${storyDoc.workspaceId}/stories/${storyDoc._id}/preview"\n` +
        `          title="${storyDoc.name}"/>\n` +
        '    <meta name="generator"\n' +
        '          content="Powered by LiveDemo -- Demo the future. Visit us at https://livedemo.ai."/>\n' +
        '    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>\n' +
        '    <meta name="robots" content="max-image-preview:large"/>\n' +
        '    <meta name="author" content="livedemo.ai"/>\n' +
        '    <meta name="copyright" content="LiveDemo"/>\n' +
        '    <meta name="twitter:card" content="player"/>\n' +
        '    <meta name="twitter:site" content="@Live_Demo_Live"/>\n' +
        `    <meta name="twitter:title" content="${storyDoc.name}"/>\n` +
        '    <meta name="twitter:description" content=""/>\n' +
        '    <meta name="twitter:image:alt" content=""/>\n' +
        '    <meta name="twitter:image"\n' +
        `          content="${thumbnailImage}"/>\n` +
        `    <meta name="twitter:player" content="${ENV.STORIES_API}/workspaces/${storyDoc.workspaceId}/stories/${storyDoc._id}/preview?step=1"/>\n` +
        '    <meta name="twitter:player:width" content="480"/>\n' +
        '    <meta name="twitter:player:height" content="242"/>\n' +
        '    <meta property="og:locale" content="en_US"/>\n' +
        '    <meta property="og:site_name" content="LiveDemo"/>\n' +
        `    <meta name="title" property="og:title" content="${storyDoc.name}"/>\n` +
        '    <meta name="description" property="og:description" content=""/>\n' +
        '    <meta name="image" property="og:image"\n' +
        `          content="${thumbnailImage}"/>\n` +
        `    <meta property="og:url" content="${ENV.STORIES_API}/workspaces/${storyDoc.workspaceId}/stories/${storyDoc._id}/preview?step=1"/>\n` +
        '    <meta property="og:image:width" content="480"/>\n' +
        '    <meta property="og:image:height" content="242"/>\n' +
        '    <meta property="og:type" content="article"/>\n' +
        `    <meta property="article:modified_time" content="${storyDoc.updatedAt.toISOString()}"/>\n`

      // htmlString += '<link href="https://fonts.cdnfonts.com/css/gagalin" rel="stylesheet">'

      // htmlString += '<script src="https://cdn.lr-in-prod.com/LogRocket.min.js" crossorigin="anonymous"></script>\n' +
      //   '<script>window.LogRocket && window.LogRocket.init(\'dotxvj/livedemo\', {  mergeIframes: true });</script>\n'

      let regexPattern = /([\w\W]+?)\<head\>([\w\W]+)/ig
      let match = regexPattern.exec(cachedHtmlPage);

      let fullHtmlString = match[1] + '<head>\n' + headString + "\n" + match[2]

      return fullHtmlString
    })
    .then((fullHtmlString) => {

      const resultResponse = {
        statusCode: ResponseCodes['200_OK'],
        headers: {
          'Origin-Agent-Cluster': '?0',
          'Access-Control-Max-Age': 600,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'ClientId,Authorization,Content-Type,Accept', // Required for CORS support to work
          // Required for CORS support to work
          'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
        }
      }

      res.set(resultResponse.headers)
      res.status(resultResponse.statusCode)
      res.send(fullHtmlString)
    })
    .catch((error) => {
      console.log(error)

      let resultResponse
      if (error.resultResponse) {

        resultResponse = error.resultResponse
      } else {


        resultResponse = {
          statusCode: ResponseCodes['200_OK'],
          headers: {
            'Origin-Agent-Cluster': '?0',
            'Access-Control-Max-Age': 600,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'ClientId,Authorization,Content-Type,Accept', // Required for CORS support to work
            // Required for CORS support to work
            'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
          },
          body: ''
        }

      }

      res.set(resultResponse.headers)
      res.status(resultResponse.statusCode)
      res.send(cachedHtmlPage)
    })
}

module.exports = handler
