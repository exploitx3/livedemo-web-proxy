const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}

const Export = new mongoose.Schema({

    type: { type: String }, // channel | workspace
    status: { type: String }, // pending | populated | expired
    channelId: { type: String, refPath: 'channelModel' },
    isIm: { type: Boolean },
    channelModel: {
      type: String,
      enum: ['Channel', 'InstantMessagesChannel']
    },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    expiresAt: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    s3Data: {
      url: { type: String },
      key: { type: String },
      bucket: { type: String },
      etag: { type: String }
    }
  }, options
)

module.exports = Export
