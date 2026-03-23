const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const IMMessageAnalysis = new mongoose.Schema({
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'InstantMessage' },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'InstantMessagesChannel' },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    analysis: {
      emojis: { type: Array },
      avg: {
        Anger: {type: Number},
        Joy: {type: Number},
        Fear: {type: Number},
        Sadness: {type: Number},
      },
      totalEmojiProb: { type: Number },
      sentiment: {
        neutrality: {type: Number},
        negativity: {type: Number},
        positivity: {type: Number},
        score: {type: Number}
      },

      text: { type: String},
      censoredText: { type: String},
    },
    text: { type: String},
    censoredText: { type: String},
    ts: { type: Number },
    tsDate: { type: Date, index: true }

  }, options
)

module.exports = IMMessageAnalysis
