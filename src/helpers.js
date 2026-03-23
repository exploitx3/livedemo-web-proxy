const stringify = require('stream-json-stringify')
const { pipeline } = require('stream')
const fs = require('fs')
const { Readable } = require("stream")

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

module.exports = {
  writeToSystem
}
