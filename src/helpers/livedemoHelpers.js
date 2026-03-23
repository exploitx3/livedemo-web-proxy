const fsp = require('fs/promises')
const axios = require('axios')
const AWS = require('aws-sdk')
const ENV = require('../envServer')

const stringify = require('stream-json-stringify')
const { pipeline } = require('stream')
const fs = require('fs')
const { Readable } = require("stream")
const ResponseCodes = require('../constants/ResponseCodes')

function writeToSystem(filePath, content, encoding) {

  return new Promise((resolve, reject) => {

    let writeStream = fs.createWriteStream(filePath, encoding = 'utf8')

    const readable = Readable.from([content], {
      highWaterMark: 0.2 * 1000000
    })

    // const stringifyStream = stringify(content, {
    //   highWaterMark: 0.2 * 1000000
    // })


    pipeline(
      readable,
      writeStream,
      (err) => {

        if (err) {

          console.error('Pipeline failed', err)
          reject(err)
        } else {

          console.log('Pipeline succeeded')
          resolve(filePath)

        }
      }
    )

    // stringifyStream.on('end', function () {
    //   writeStream.end()
    //   resolve(filePath)
    // })
    //
    // stringifyStream.on('error', function (err) {
    //   reject(err)
    // })
    //
    // writeStream.on('error', function (err) {
    //   reject(err)
    // })
  })

    .then(() => {


      return filePath
    })
}
function writeToSystemFromStream(filePath, contentStream, encoding) {

  return new Promise((resolve, reject) => {

    let writeStream = fs.createWriteStream(filePath, encoding = 'utf8')

    // const readable = Readable.from([content], {
    //   highWaterMark: 0.2 * 1000000
    // })

    // const stringifyStream = stringify(content, {
    //   highWaterMark: 0.2 * 1000000
    // })


    pipeline(
      contentStream,
      writeStream,
      (err) => {

        if (err) {

          console.error('Pipeline failed', err)
          reject(err)
        } else {

          console.log('Pipeline succeeded')
          resolve(filePath)

        }
      }
    )

    // stringifyStream.on('end', function () {
    //   writeStream.end()
    //   resolve(filePath)
    // })
    //
    // stringifyStream.on('error', function (err) {
    //   reject(err)
    // })
    //
    // writeStream.on('error', function (err) {
    //   reject(err)
    // })
  })

    .then(() => {


      return filePath
    })
}

function readLiveDemo(path) {

  return Promise.all([
      fsp.readFile(`${path}/manifest.json`),
      fsp.readFile(`${path}/localStorage.json`),
      fsp.readFile(`${path}/firstDoc.json`),
      fsp.readFile(`${path}/cookies.json`)
    ])
    .then(([manifestStr, localStorageStr, firstDocStr, cookiesStr]) => {
      let manifestJson = JSON.parse(manifestStr)
      let firstDocJson = JSON.parse(firstDocStr).firstDoc
      let localStorageJson = JSON.parse(localStorageStr).localStorageMine
      let cookies = JSON.parse(cookiesStr).cookies
      let requests = []

      let resolveFilesChain = Promise.resolve()
      for (let i = 0; i < manifestJson.length; i++) {
        let fileName = manifestJson[i]
        resolveFilesChain = resolveFilesChain
          .then(() => {

            return fsp.readFile(`${path}/${fileName}`)
          })
          .then(fileStr => {
            let parsedRequest = JSON.parse(fileStr)

            requests.push(parsedRequest)
          })
      }

      return resolveFilesChain
        .then(() => {
          return {
            manifestJson,
            localStorageJson,
            cookies,
            firstDocJson,
            requests
          }
        })
    })
}


async function saveRequestsToFileSystem(dir, shouldRewriteFiles, requestFileNames, requests) {

  try {


    await fsp.access(`${dir}/manifest.json`)
      .then(() => {

        return fsp.readFile(`${dir}/manifest.json`)
          .then(fileStr => JSON.parse(fileStr))
      })
      .then((parsedManifest) => {
        let oldFileNamesArr = parsedManifest

        let newFileNames = oldFileNamesArr.concat(requestFileNames)

        newFileNames = newFileNames.filter((fileName, index) => newFileNames.indexOf(fileName) === index)

        return fsp.writeFile(`${dir}/manifest.json`, JSON.stringify(newFileNames, null, 2))
      })
      .catch((err) => {
        console.log('manifest.json created')

        return fsp.writeFile(`${dir}/manifest.json`, JSON.stringify(requestFileNames, null, 2))
      })


  } catch (error) {
    console.error(error)
  }

  let promiseChain = Promise.resolve()

  for (let i = 0; i < requests.length; i++) {
    let req = requests[i]

    promiseChain = promiseChain.then(() => {
      return fsp.writeFile(`${dir}/${req.fileName}`, JSON.stringify(req, null, 2))
    })
  }

  return promiseChain
}


async function saveToFilesystem(dir, shouldRewriteFiles, requestFileNames, requests, localStorage, cookies, firstDoc) {

  try {

    await fsp.access(`${dir}`)
      .then(() => {
        return
      })
      .catch(() => {

        return fsp.mkdir(dir)
      })

    await fsp.access(`${dir}/manifest.json`)
      .then(() => {

        return fsp.readFile(`${dir}/manifest.json`)
          .then(fileStr => JSON.parse(fileStr))
      })
      .then((parsedManifest) => {
        let oldFileNamesArr = parsedManifest

        let newFileNames = oldFileNamesArr.concat(requestFileNames)

        newFileNames = newFileNames.filter((fileName, index) => newFileNames.indexOf(fileName) === index)

        return fsp.writeFile(`${dir}/manifest.json`, JSON.stringify(newFileNames, null, 2))
      })
      .catch((err) => {
        console.log('does not exist')

        return fsp.writeFile(`${dir}/manifest.json`, JSON.stringify(requestFileNames, null, 2))
      })


    // const localStorage = Base64ToUint8Array(body.localStorage)
    // const localStorageStr = new TextDecoder().decode(localStorage);

    await fsp.writeFile(`${dir}/localStorage.json`, JSON.stringify({ localStorage: localStorage }, null, 2))
    await fsp.writeFile(`${dir}/cookies.json`, JSON.stringify({ cookies: cookies }, null, 2))

    await fsp.access(`${dir}/firstDoc.json`)
      .then(() => {

        if (shouldRewriteFiles) {
          return fsp.writeFile(`${dir}/firstDoc.json`, JSON.stringify({ firstDoc: firstDoc }, null, 2))
        }

        return
      })
      .catch(() => {

        return fsp.writeFile(`${dir}/firstDoc.json`, JSON.stringify({ firstDoc: firstDoc }, null, 2))
      })


  } catch (error) {
    console.error(error)
  }

  let promiseChain = Promise.resolve()

  for (let i = 0; i < requests.length; i++) {
    let req = requests[i]

    promiseChain = promiseChain.then(() => {
      return fsp.writeFile(`${dir}/${req.fileName}`, JSON.stringify(req, null, 2))
    })
  }

  return promiseChain
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

  return true
}


function uploadImage(imageData, imageName) {
  const s3Bucket = new AWS.S3({
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    params: { Bucket: 'livedemo-cdn' }
  })

  console.log(s3Bucket)
  console.log('AWS_ACCESS_KEY_ID ' + ENV.AWS_ACCESS_KEY_ID)
  console.log('AWS_SECRET_ACCESS_KEY ' + ENV.AWS_SECRET_ACCESS_KEY)


  let buf = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64')
  let data = {
    Key: 'story-images/' + imageName,
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


function uploadBufferImage(imageBuff, mimeType, imageName) {
  const s3Bucket = new AWS.S3({
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    params: { Bucket: 'livedemo-cdn' }
  })

  console.log(s3Bucket)
  console.log('AWS_ACCESS_KEY_ID ' + ENV.AWS_ACCESS_KEY_ID)
  console.log('AWS_SECRET_ACCESS_KEY ' + ENV.AWS_SECRET_ACCESS_KEY)


  let data = {
    Key: 'story-images/' + imageName,
    Body: imageBuff,
    ACL: 'public-read',
    ContentType: mimeType
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

function uploadScreenImage(imageBuff, mimeType, imageName) {
  const s3Bucket = new AWS.S3({
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    params: { Bucket: 'livedemo-cdn' }
  })

  console.log(s3Bucket)
  console.log('AWS_ACCESS_KEY_ID ' + ENV.AWS_ACCESS_KEY_ID)
  console.log('AWS_SECRET_ACCESS_KEY ' + ENV.AWS_SECRET_ACCESS_KEY)


  let data = {
    Key: 'screen-images/' + imageName,
    Body: imageBuff,
    ACL: 'public-read',
    ContentType: mimeType
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

function uploadScreenVideo(videoBuff, mimeType, videoName) {
  const s3Bucket = new AWS.S3({
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    params: { Bucket: 'livedemo-cdn' }
  })

  console.log(s3Bucket)
  console.log('AWS_ACCESS_KEY_ID ' + ENV.AWS_ACCESS_KEY_ID)
  console.log('AWS_SECRET_ACCESS_KEY ' + ENV.AWS_SECRET_ACCESS_KEY)


  let data = {
    Key: 'screen-videos/' + videoName,
    Body: videoBuff,
    ACL: 'public-read',
    ContentType: mimeType
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


function findNodeByNodeName(nodeName, nodes) {
  let flatChildNodes = nodes.reduce((accum, node) => {
    if (node.childNodes) {
      accum = accum.concat(node.childNodes)
    }

    return accum
  }, [])


  for (let i = 0; i < flatChildNodes.length; i++) {
    let currentNode = flatChildNodes[i]

    let foundNode = currentNode.nodeName === nodeName

    if (foundNode) {

      return currentNode
    }
  }

  return findNodeByNodeName(nodeName, flatChildNodes)
}

function findNodeByTagValue(searchAttr, searchAttrValue, nodes) {

  let flatChildNodes = nodes.reduce((accum, node) => {
    if (node.childNodes) {
      accum = accum.concat(node.childNodes)
    }

    return accum
  }, [])


  for (let i = 0; i < flatChildNodes.length; i++) {
    let currentNode = flatChildNodes[i]

    if (currentNode.attrs) {

      for (let j = 0; j < currentNode.attrs.length; j++) {
        let currentAttr = currentNode.attrs[j]
        let foundAttr = currentAttr.name === searchAttr && currentAttr.value === searchAttrValue

        if (foundAttr) {

          return currentNode
        }
      }
    }
  }

  return findNodeByTagValue(searchAttr, searchAttrValue, flatChildNodes)
}


function replaceLinkVarsInText(text, link) {
  let result = text;

  link.variables.forEach(variable => {
    const pattern = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, 'g');
    result = result.replace(pattern, variable.value);
  });

  return result;
}

function processLiveDemoLinkUpdates(liveDemo, link) {


  liveDemo.screens = liveDemo.screens.map(screen => {
    screen.steps = screen.steps.map(step => {
      if (step && step.view) {
        step.view.content = replaceLinkVarsInText(step.view.content, link)
        step.view.popup.title = replaceLinkVarsInText(step.view.popup.title, link)
        step.view.popup.description = replaceLinkVarsInText(step.view.popup.description, link)

      }

      return step
    })

    return screen
  })

  return liveDemo
}


module.exports = {
  readLiveDemo,
  saveToFilesystem,
  saveRequestsToFileSystem,
  validateUserHasAccessToWorkspace,
  validateBody,
  authReq,
  getUserTokenAuth,
  writeToSystem,
  writeToSystemFromStream,
  uploadImage,
  findNodeByNodeName,
  findNodeByTagValue,
  uploadBufferImage,
  uploadScreenImage,
  processLiveDemoLinkUpdates,
  replaceLinkVarsInText

}
