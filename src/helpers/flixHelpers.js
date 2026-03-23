const moment = require('moment')

const fsp = require('fs/promises')
const axios = require('axios')
const AWS = require('aws-sdk')
const ENV = require('../envServer')
const ResponseCodes = require('../constants/ResponseCodes')
const RenderEventTypes = require('../constants/RenderEventTypes')
const helpers = require('../helpers')
const stringify = require('stream-json-stringify')
const { pipeline, Readable } = require('stream')
const fs = require('fs')
const short = require('short-uuid')
const monq = require('monq')
const Mux = require('@mux/mux-node')

const { Video: muxVideo, Data: muxData } = new Mux(ENV.MUX_TOKEN_ID, ENV.MUX_TOKEN_SECRET)


function waitUntilAssetRenditionsAreReady(assetId, pollTime, count) {

  return new Promise((resolve, reject) => {
    let promiseChain = Promise.resolve()

    for (let i = 0; i < count; i++) {
      promiseChain = promiseChain.then(() => {

        return muxVideo.Assets.get(assetId)
          .then((assetInfo) => {

            if (assetInfo.static_renditions && assetInfo.static_renditions.status === 'ready') {

              let err = new Error('successful')
              err.assetInfo = assetInfo
              throw err

            } else {

              return new Promise((checkResolve, checkReject) => {
                setTimeout(function () {
                  checkResolve()
                }, pollTime)
              })
            }

          })
      })
    }

    promiseChain = promiseChain.catch((err) => {
      if (err.assetInfo) {

        resolve(err.assetInfo)
      } else {

        reject('waitUntilAssetIsReady has timed-out')
      }
    })

  })
}

function waitUntilAssetIsReady(assetId, pollTime, count) {

  return new Promise((resolve, reject) => {
    let promiseChain = Promise.resolve()

    for (let i = 0; i < count; i++) {
      promiseChain = promiseChain.then(() => {

        return muxVideo.Assets.get(assetId)
          .then((assetInfo) => {

            if (assetInfo.status !== 'ready') {

              return new Promise((checkResolve, checkReject) => {
                setTimeout(function () {
                  checkResolve()
                }, pollTime)
              })
            } else {

              let err = new Error('successful')
              err.assetInfo = assetInfo
              throw err

            }

          })
      })
    }

    promiseChain = promiseChain.catch((err) => {
      if (err.assetInfo) {

        resolve(err.assetInfo)
      } else {

        reject('waitUntilAssetIsReady has timed-out')
      }
    })

  })
}

function waitUntilAssetIsUploaded(uploadId, pollTime, count) {
  return new Promise((resolve, reject) => {
    let promiseChain = Promise.resolve()

    for (let i = 0; i < count; i++) {
      promiseChain = promiseChain.then(() => {

        return muxVideo.Uploads.get(uploadId)
          .then((assetInfo) => {

            if (assetInfo.status !== 'asset_created') {

              return new Promise((checkResolve, checkReject) => {
                setTimeout(function () {
                  checkResolve()
                }, pollTime)
              })
            } else {

              let err = new Error('successful')
              err.assetInfo = assetInfo
              throw err

            }

          })
      })
    }

    promiseChain = promiseChain.catch((err) => {
      if (err.assetInfo) {

        resolve(err.assetInfo)
      } else {

        reject('waitUntilAssetIsUploaded has timed-out')
      }
    })

  })
}



function createMuxClips(videoAssetId, renderEvents) {
  let videoEvents = renderEvents.filter(event => event.type === 'video')

  let videoUploads = videoEvents.map((event) => {

    return muxVideo.Assets.create({
        input: [
          {
            "url": `mux://assets/${videoAssetId}`,
            "start_time": event.startMillis,
            "end_time": event.endMillis
          }
        ],
        playback_policy: 'public',
        "mp4_support": "standard"
      })
      .then((assetObj) => {

        return waitUntilAssetIsReady(assetObj.id, 5000, 5)
          .then((assetInfo) => {

            assetInfo.videoId = event.videoId
            return assetInfo
          })

      })
  })


  return Promise.all(videoUploads)
}

function saveMuxVideo(filePath, videoData) {
  let videoBuff = videoData
  if(typeof videoBuff === 'string') {

    videoBuff = Buffer.from(videoData.replace(/^data:video\/\w+;base64,/, ''), 'base64')
  }

  return fsp.writeFile(filePath, videoData)
    .then(() => {
      return filePath
    })
}

function uploadMuxVideo(videoData) {
  let videoBuff = videoData
  if(typeof videoBuff === 'string') {

    videoBuff = Buffer.from(videoData.replace(/^data:video\/\w+;base64,/, ''), 'base64')
  }

  return muxVideo.Uploads.create({
      new_asset_settings: {
        playback_policy: 'public',
        "mp4_support": "standard"
      },
    })
    .then((uploadObj) => {

      return axios.put(uploadObj.url, videoBuff, {})

        .then((uploadResp) => {

          return waitUntilAssetIsUploaded(uploadObj.id, 5000, 5)
            .then(uploadInfo => {

              return waitUntilAssetIsReady(uploadInfo.asset_id, 5000, 5)
                .then((assetInfo) => {
                  assetInfo.assetId = uploadInfo.asset_id

                  return assetInfo
                })
            })
        })
    })
    .then((uploadedAssetInfo) => {

      console.log(uploadedAssetInfo)

      return uploadedAssetInfo
    })
}

function uploadVideo(videoData, videoName) {
  const s3Bucket = new AWS.S3({
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    params: { Bucket: 'livedemo-cdn' }
  })

  console.log('AWS_ACCESS_KEY_ID ' + ENV.AWS_ACCESS_KEY_ID)
  console.log('AWS_SECRET_ACCESS_KEY ' + ENV.AWS_SECRET_ACCESS_KEY)


  let buf = Buffer.from(videoData.replace(/^data:video\/\w+;base64,/, ''), 'base64')
  let data = {
    Key: 'flix-videos/' + videoName + '.webm',
    Body: buf,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: 'video/webm'
  }

  return new Promise(async (resolve, reject) => {
    let uploadResult = null
    try {

      uploadResult = await s3Bucket.upload(data).promise()

      console.log('successfully uploaded the video!')
      resolve(uploadResult)
    } catch (error) {
      console.log(error)
      console.log('Error uploading data: ', uploadResult)
      reject(err)
    }


  })

}


function uploadImage(imageData, imageName) {
  const s3Bucket = new AWS.S3({
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    params: { Bucket: 'livedemo-cdn' }
  })

  console.log('AWS_ACCESS_KEY_ID ' + ENV.AWS_ACCESS_KEY_ID)
  console.log('AWS_SECRET_ACCESS_KEY ' + ENV.AWS_SECRET_ACCESS_KEY)


  let buf = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64')
  let data = {
    Key: 'flix-images/' + imageName + '.png',
    Body: buf,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: 'image/png'
  }

  return new Promise(async (resolve, reject) => {
    let uploadResult = null
    try {

      uploadResult = await s3Bucket.upload(data).promise()

      console.log('successfully uploaded the image!')
      resolve(uploadResult)
    } catch (error) {
      console.log(error)
      console.log('Error uploading data: ', uploadResult)
      reject(err)
    }


  })

}

async function getUserTokenAuth(token) {
  return axios.post(`${ENV.URL}/users/token-authenticate`, {
      token: token
    })
    .then(function (response) {

      return response.data
    })

}


async function authReq(req) {
  let authHeader = req.get('Authorization')
  if (!authHeader) {
    throw new Error('No Authorization header set')
  }

  let token = authHeader.split(' ')[1]
  if (!token) {
    throw new Error('Authorization token not found')
  }

  let authUser = await getUserTokenAuth(token)

  return {
    authUser,
    authToken: token
  }
}


function validateBody(body, validatorFunction) {

  const validationResult = validatorFunction(body)
  if (validationResult.error) {
    const response = {
      statusCode: 500,
      headers: {
        'Access-Control-Max-Age': 600,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'ClientId,Authorization,Content-Type,Accept', // Required for CORS support to work
        // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify({
        error: validationResult.error
      })
    }

    let error = new Error('Invalid body')
    error.resultResponse = response

    throw error
  }

  return validationResult
}

function validateUserHasAccessToWorkspace(userDoc, workspaceId) {


  const foundWkspace = userDoc.workspaces.find(workspace => workspace._id === workspaceId)
  if (!foundWkspace) {
    const resultResponse = {
      statusCode: ResponseCodes['400_BAD_REQUEST'],
      headers: {
        'Access-Control-Max-Age': 600,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'ClientId,Authorization,Content-Type,Accept', // Required for CORS support to work
        // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      }
    }

    let error = new Error('400')
    error.resultResponse = resultResponse

    throw error
  }

}


function getRenderEvents(capturedEvents, videoStartMs, videoEndMs, screenshots) {
  let renderEvents = []

  let startTime = videoStartMs
  let endTime = videoEndMs

  let startMillis = 0
  let videoEndMillis = parseFloat(
    Math.abs(
      moment.duration(moment(startTime).diff(moment(endTime))).asMilliseconds() / 1000.0
    ).toPrecision(4)
  )
  let endMillis = 0

  let clickEvents = capturedEvents.filter(event => {
    return event.type === 'click' && event.timeMs > videoStartMs
    })
    .sort((firstEvent, secondEvent) => firstEvent.timeMs - secondEvent.timeMs)


  for (let i = 0; i < clickEvents.length; i++) {
    let event = clickEvents[i]

    endTime = event.timeMs
    endMillis = parseFloat(
      Math.abs(
        moment.duration(moment(event.timeMs).diff(moment(videoStartMs))).asMilliseconds() / 1000.0
      ).toPrecision(4)
    )

    let testTime = event.timeMs - videoStartMs

    if(endTime < startTime && i === 0) {

      endTime = videoStartMs
      endMillis = 0
    } else {

      let videoRenderEvent = {
        startTime: startTime,
        endTime: endTime,
        startMillis,
        endMillis,
        videoId: short.uuid(),
        type: RenderEventTypes.VIDEO
      }

      renderEvents.push(videoRenderEvent)
    }




    let imageRenderEvent = {
      startTime: endTime,
      startMillis: endMillis,
      type: RenderEventTypes.IMAGE,
      imageId: event.clickId,
      frameX: event.frameX,
      frameY: event.frameY,
      description:'',
      image: screenshots[event.clickId]
    }

    renderEvents.push(imageRenderEvent)

    startTime = endTime
    startMillis = endMillis
  }

  if (startTime < videoEndMs) {
    endTime = videoEndMs

    let videoRenderEvent = {
      startTime: startTime,
      endTime: endTime,
      startMillis,
      endMillis: videoEndMillis,
      videoId: short.uuid(),
      type: RenderEventTypes.VIDEO
    }

    renderEvents.push(videoRenderEvent)

    let imageRenderEvent = {
      startTime: endTime,
      startMillis: videoEndMillis,
      type: RenderEventTypes.IMAGE,
      imageId: 'final',
      image: screenshots['final']
    }

    renderEvents.push(imageRenderEvent)
  }

  console.log(renderEvents)
  return renderEvents
}


function enqueueProcessStoryDemo(storyDemoId) {
  const client = monq(ENV.DB_URI || 'mongodb://localhost:27017/livedemo_app')
  const queue = client.queue('storyDemos', { collection: 'jobs-monq' })

  return new Promise((resolve, reject) => {
    let jobName = 'processStoryDemo'
    queue.enqueue(jobName, { storyDemoId }, function (err, job) {
      if (err) {
        reject(err)
      }
      console.log('Enqueued:', job.data)
      resolve()
    })

  })
}

module.exports = {
  authReq,
  getUserTokenAuth,
  validateBody,
  validateUserHasAccessToWorkspace,
  uploadImage,
  uploadVideo,
  saveMuxVideo,
  uploadMuxVideo,
  createMuxClips,
  getRenderEvents,
  enqueueProcessStoryDemo

}
