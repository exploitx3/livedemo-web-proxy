const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const Conversation = new mongoose.Schema({
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    channelName: { type: String },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    userSlackIds: [{ type: String }],
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMember' }],
    startTimestamp: { type: Number },
    endTimestamp: { type: Number },
    startDate: { type: Date, index: true },
    endDate: { type: Date, index: true },
    analysis: {
      Anger: { type: Number },
      Joy: { type: Number },
      Fear: { type: Number },
      Sadness: { type: Number },
      totalEmojiProb: { type: Number },
      emotion: { type: String },
      leadEmotion: { type: String },
      sentiment: {
        neutrality: { type: Number },
        negativity: { type: Number },
        positivity: { type: Number },
        score: { type: Number },
        leadSentiment: { type: String }
      }
    },
    slackLink: { type: String },
    isIM: { type: Boolean, default: false },
    isEncrypted: { type: Boolean, default: false },
    messagesCount: { type: Number }
  }, options
)

module.exports = Conversation
