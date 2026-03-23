const mongoose = require('mongoose')
require('mongoose-long')(mongoose)

const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const File = new mongoose.Schema({

    slackId: { type: String },
    name: { type: String, text: true },
    title: { type: String },
    userSlackId: { type: String },
    channelSlackId: { type: String },
    fileType: { type: String },
    mimeType: { type: String },
    size: { type: mongoose.Types.Long, default: 0 },
    urlPrivate: { type: String },
    urlPrivateDownload: { type: String },
    created: { type: Date },
    ts: { type: Number },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },

    s3Data: {
      url: { type: String },
      key: { type: String },
      bucket: { type: String },
      etag: { type: String }
    }
  }, options
)

module.exports = File
