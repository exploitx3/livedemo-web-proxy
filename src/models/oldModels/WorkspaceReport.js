const mongoose = require('mongoose')
const SingleWorkspaceReportSchema = require('./SingleWorkspaceReport')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const WorkspaceReport = new mongoose.Schema({
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    workspaceName: { type: String },
    dailyReport: SingleWorkspaceReportSchema,
    weeklyReport: SingleWorkspaceReportSchema,
    monthlyReport: SingleWorkspaceReportSchema,
    quarterlyReport: SingleWorkspaceReportSchema,
    workspaceSlackId: { type: String },
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

module.exports = WorkspaceReport
