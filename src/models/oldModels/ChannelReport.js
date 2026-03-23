const mongoose = require('mongoose')
const SingleChannelReport = require('./SingleChannelReport')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const ChannelReport = new mongoose.Schema({
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    channelName: { type: String },
    messagesCount: { type: Number },
    dailyReport: SingleChannelReport,
    weeklyReport: SingleChannelReport,
    monthlyReport: SingleChannelReport,
    quarterlyReport: SingleChannelReport,
    // analysis: {
    //   Anger: { type: Number },
    //   Joy: { type: Number },
    //   Fear: { type: Number },
    //   Sadness: { type: Number },
    //   totalEmojiProb: { type: Number },
    //   emotion: { type: String },
    //   leadEmotion: { type: String },
    //   sentiment: {
    //     neutrality: { type: Number },
    //     negativity: { type: Number },
    //     positivity: { type: Number },
    //     score: { type: Number },
    //     countNeutral: { type: Number },
    //     countNegative: { type: Number },
    //     countPositive: { type: Number }
    //   }
    // },
  }, options
)

module.exports = ChannelReport
