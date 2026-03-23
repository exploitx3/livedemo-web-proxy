const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const SingleChannelReport = new mongoose.Schema({
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    workspaceName: { type: String },
    startTimestamp: { type: Number },
    endTimestamp: { type: Number },
    startDate: { type: Date, index: true },
    endDate: { type: Date, index: true },
    imageS3Data: {},
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
        countNeutral: { type: Number },
        countNegative: { type: Number },
        countPositive: { type: Number }
      }
    },
    conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
    mostActiveMembers: [{
      memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
      memberName: { type: String },
      analysisCount: { type: Number }
    }],
    topEmotionMembers: {
      happiness: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMember' },
      sadness: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMember' },
      anger: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMember' },
      fear: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMember' }
    }
  }, options
)

module.exports = SingleChannelReport
