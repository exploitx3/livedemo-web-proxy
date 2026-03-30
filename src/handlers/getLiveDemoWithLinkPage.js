const helpers = require('../helpers/livedemoHelpers')
const fsp = require('fs/promises')
const ResponseCodes = require('../constants/ResponseCodes')
const ScreenTypes = require('../constants/ScreenTypes')
const ENV = require('../envServer')
const axios = require('axios')

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

const handler = function (req, res) {
    let {Models, conn} = req.mongo

    let cachedHtmlPage = req.appHtmlCache.html

    let storyId = req.params.storyId
    let linkId = req.params.linkId

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
                    options: {sort: {'index': 1}}
                })
                .lean()
        })
        .then((storyDoc) => {
            if (linkId) {
                return Models.Link.findOne({_id: linkId}).lean()
                    .then(linkDoc => {
                        if (!linkDoc) {
                            throw new Error('Cannot find link')
                        }

                        storyDoc = helpers.processLiveDemoLinkUpdates(storyDoc, linkDoc)

                        return storyDoc
                    })
            } else {
                storyDoc = helpers.processLiveDemoLinkUpdates(storyDoc, {variables: storyDoc.custom.variables || []})

                return storyDoc
            }

        })
        .then((storyDoc) => {
            const firstScreen = storyDoc.screens && storyDoc.screens.length && storyDoc.screens[0]

            const thumbnailImage = firstScreen.type === ScreenTypes.SCREEN_VIDEO
                ? `https://image.mux.com/${firstScreen.asset.playback_ids[0].id}/thumbnail.png`
                : firstScreen.imageUrl

            // Each link gets its own canonical URL since variable substitutions produce unique content
            const canonicalUrl = linkId
                ? `${ENV.STORIES_API}/workspaces/${storyDoc.workspaceId}/stories/${storyDoc._id}/links/${linkId}/preview`
                : `${ENV.STORIES_API}/workspaces/${storyDoc.workspaceId}/stories/${storyDoc._id}/preview`

            const rawTitle = storyDoc.name || 'Interactive Demo'
            const rawDescription = `Explore an interactive demo of ${rawTitle}. Built with LiveDemo — the platform for creating and sharing stunning product demos.`
            const rawImageAlt = `${rawTitle} — interactive product demo`

            const safeTitle = escapeHtml(rawTitle)
            const safeDescription = escapeHtml(rawDescription)
            const safeImageAlt = escapeHtml(rawImageAlt)

            const imageWidth = firstScreen.width || 1200
            const imageHeight = firstScreen.height || 630

            const jsonLd = JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: rawTitle,
                description: rawDescription,
                url: canonicalUrl,
                image: {
                    '@type': 'ImageObject',
                    url: thumbnailImage,
                    width: imageWidth,
                    height: imageHeight,
                },
                dateModified: storyDoc.updatedAt.toISOString(),
                datePublished: storyDoc.createdAt.toISOString(),
                publisher: {
                    '@type': 'Organization',
                    name: 'LiveDemo',
                    url: 'https://livedemo.ai',
                    logo: {
                        '@type': 'ImageObject',
                        url: 'https://livedemo-cdn.s3.amazonaws.com/static/logo-round.png',
                    },
                },
            })

            const headString = `
    <link rel="shortcut icon" type="image/png" href="https://livedemo-cdn.s3.amazonaws.com/static/logo-round.png"/>
    <link rel="apple-touch-icon" href="https://livedemo-cdn.s3.amazonaws.com/static/logo-round.png"/>
    <meta name="msapplication-TileImage" content="https://livedemo-cdn.s3.amazonaws.com/static/logo-round.png"/>
    <link rel="canonical" href="${canonicalUrl}"/>
    <link rel="alternate" type="application/json+oembed"
          href="${ENV.STORIES_API}/oembed?url=${encodeURIComponent(canonicalUrl)}"
          title="${safeTitle}"/>
    <meta name="generator" content="Powered by LiveDemo — Demo the future. Visit us at https://livedemo.ai."/>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="robots" content="index, follow, max-image-preview:large"/>
    <meta name="author" content="livedemo.ai"/>
    <meta name="copyright" content="LiveDemo"/>
    <title>${safeTitle} | LiveDemo</title>
    <meta name="title" content="${safeTitle} | LiveDemo"/>
    <meta name="description" content="${safeDescription}"/>
    <meta property="og:locale" content="en_US"/>
    <meta property="og:site_name" content="LiveDemo"/>
    <meta property="og:type" content="website"/>
    <meta property="og:title" content="${safeTitle} | LiveDemo"/>
    <meta property="og:description" content="${safeDescription}"/>
    <meta property="og:url" content="${canonicalUrl}"/>
    <meta property="og:image" content="${thumbnailImage}"/>
    <meta property="og:image:secure_url" content="${thumbnailImage}"/>
    <meta property="og:image:width" content="${imageWidth}"/>
    <meta property="og:image:height" content="${imageHeight}"/>
    <meta property="og:image:alt" content="${safeImageAlt}"/>
    <meta property="og:image:type" content="image/png"/>
    <meta property="og:updated_time" content="${storyDoc.updatedAt.toISOString()}"/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:site" content="@Live_Demo_Live"/>
    <meta name="twitter:title" content="${safeTitle} | LiveDemo"/>
    <meta name="twitter:description" content="${safeDescription}"/>
    <meta name="twitter:image" content="${thumbnailImage}"/>
    <meta name="twitter:image:alt" content="${safeImageAlt}"/>
    <script type="application/ld+json">${jsonLd}</script>`

            let regexPattern = /([\w\W]+?)\<head\>([\w\W]+)/ig
            let match = regexPattern.exec(cachedHtmlPage)

            // Strip any existing <title> from the base template to avoid duplicates
            let baseHeadContent = match[2].replace(/<title>[^<]*<\/title>/gi, '')

            let fullHtmlString = match[1] + '<head>\n' + headString + '\n' + baseHeadContent

            return fullHtmlString
        })
        .then((fullHtmlString) => {

            const resultResponse = {
                statusCode: ResponseCodes['200_OK'],
                headers: {
                    'Origin-Agent-Cluster': '?0',
                    'Access-Control-Max-Age': 600,
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'ClientId,Authorization,Content-Type,Accept',
                    'Access-Control-Allow-Credentials': true,
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
                        'Access-Control-Allow-Headers': 'ClientId,Authorization,Content-Type,Accept',
                        'Access-Control-Allow-Credentials': true,
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
